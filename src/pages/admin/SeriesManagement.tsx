import React, { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, setDoc, query, orderBy, writeBatch, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { Series, SeriesType, SeriesStatus } from '../../types';
import { Plus, Edit2, Trash2, Search, Filter, X, Upload, Loader2, FileArchive } from 'lucide-react';
import { compressImage, splitAndCompressImage } from '../../utils/imageCompression';
import { uploadToStorj } from '../../utils/storjUpload';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'motion/react';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
  'Horror', 'Mystery', 'Psychological', 'Romance', 
  'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

export const SeriesManagement: React.FC = () => {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<SeriesType | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [seriesToDelete, setSeriesToDelete] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Smart Import States
  const [isSmartImportModalOpen, setIsSmartImportModalOpen] = useState(false);
  const [isSmartImporting, setIsSmartImporting] = useState(false);
  const [smartImportLog, setSmartImportLog] = useState<Array<{ message: string; type: 'info' | 'success' | 'warning' | 'error'; timestamp: string }>>([]);
  const smartZipInputRef = useRef<HTMLInputElement>(null);
  const cancelImportRef = useRef(false);
  
  const [isSmartImportMode, setIsSmartImportMode] = useState(false);
  const [smartImportFile, setSmartImportFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    coverImage: '',
    backgroundImage: '',
    status: 'Ongoing' as SeriesStatus,
    type: 'Manga' as SeriesType,
    genres: [] as string[],
    tags: [] as string[],
    author: '',
    artist: '',
    releaseYear: new Date().getFullYear(),
    slug: '',
  });

  useEffect(() => {
    const q = query(collection(db, 'series'), orderBy('lastUpdated', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSeriesList(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Series)));
    });
    return () => unsubscribe();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'backgroundImage' = 'coverImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      console.log(`Starting ${field} compression for: ${file.name}`, {
        size: (file.size / 1024).toFixed(2) + ' KB',
        type: file.type
      });

      // Compress image to ensure it's under 1MB (0.9MB target)
      const base64Image = await compressImage(file, 0.9);
      
      console.log(`Successfully compressed ${field}: ${file.name}`);
      
      setFormData(prev => ({ ...prev, [field]: base64Image }));
      setUploadProgress(100);
      
      // Automatically save to database if editing an existing series
      if (editingSeries) {
        await updateDoc(doc(db, 'series', editingSeries.id), {
          [field]: base64Image,
          lastUpdated: Timestamp.now()
        });
      }
    } catch (error: any) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const filteredSeries = seriesList.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || s.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const generateSlug = async (title: string) => {
    let slugTitle = title;
    
    // Check if title contains Arabic characters
    const arabicRegex = /[\u0600-\u06FF]/;
    if (arabicRegex.test(title)) {
      try {
        const response = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: title, target: 'English' })
        });
        if (response.ok) {
          const data = await response.json();
          if (data.translatedText) {
            slugTitle = data.translatedText;
          }
        }
      } catch (error) {
        console.error("Translation failed:", error);
      }
    }
    
    return slugTitle.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleSingleSeriesSmartImport = async () => {
    if (!smartImportFile) return;

    setIsSmartImportModalOpen(true);
    setIsSmartImporting(true);
    cancelImportRef.current = false;
    setSmartImportLog([{ message: `Starting Smart Import for ${formData.title}...`, type: 'info', timestamp: new Date().toLocaleTimeString() }]);
    
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(smartImportFile);
      const imageFiles = Object.keys(contents.files)
        .filter(name => !contents.files[name].dir && /\.(jpe?g|png|gif|webp|avif|bmp|tiff?|jfif|svg)$/i.test(name))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      if (imageFiles.length === 0) {
        setSmartImportLog(prev => [...prev, { message: `Error: No images found in ZIP.`, type: 'error', timestamp: new Date().toLocaleTimeString() }]);
        setIsSmartImporting(false);
        return;
      }

      setSmartImportLog(prev => [...prev, { message: `Found ${imageFiles.length} images. Parsing chapters...`, type: 'info', timestamp: new Date().toLocaleTimeString() }]);

      // Group images by Chapter
      const chaptersObj: Record<string, string[]> = {};
      
      for (const path of imageFiles) {
        const parts = path.split('/').filter(Boolean);
        const filename = parts.pop()!;
        
        let chapterStr = '1';

        let foundChapter = false;
        for (const part of parts) {
          const match = part.match(/(?:chapter|ch|chap|ep|episode)\s*(\d+(\.\d+)?)/i) || part.match(/^(\d+(\.\d+)?)$/);
          if (match) {
            chapterStr = match[1];
            foundChapter = true;
            break;
          }
        }
        
        if (!foundChapter && parts.length > 0) {
           const lastFolder = parts[parts.length - 1];
           const match = lastFolder.match(/(\d+(\.\d+)?)/);
           if (match) chapterStr = match[1];
        }

        if (!chaptersObj[chapterStr]) chaptersObj[chapterStr] = [];
        chaptersObj[chapterStr].push(path);
      }

      const seriesName = formData.title;
      let seriesId = '';
      const existingSeries = seriesList.find(s => s.title.toLowerCase() === seriesName.toLowerCase());
      
      const slug = formData.slug || await generateSlug(seriesName);
      const seriesData = {
        ...formData,
        slug,
        rating: existingSeries?.rating || 5,
        ratingCount: existingSeries?.ratingCount || 1,
        views: existingSeries?.views || 0,
        dailyViews: existingSeries?.dailyViews || 0,
        weeklyViews: existingSeries?.weeklyViews || 0,
        monthlyViews: existingSeries?.monthlyViews || 0,
        lastUpdated: Timestamp.now(),
      };

      if (existingSeries) {
        seriesId = existingSeries.id;
        setSmartImportLog(prev => [...prev, { message: `Updating existing series: ${seriesName}`, type: 'success', timestamp: new Date().toLocaleTimeString() }]);
        await updateDoc(doc(db, 'series', seriesId), seriesData);
      } else {
        setSmartImportLog(prev => [...prev, { message: `Creating new series: ${seriesName}`, type: 'info', timestamp: new Date().toLocaleTimeString() }]);
        seriesId = slug;
        await setDoc(doc(db, 'series', seriesId), { ...seriesData, createdAt: Timestamp.now() });
      }

      // Process chapters
      for (const [chapterStr, paths] of Object.entries(chaptersObj)) {
        if (cancelImportRef.current) throw new Error("Import cancelled by user.");
        const chapterNumber = parseFloat(chapterStr) || 1;
        setSmartImportLog(prev => [...prev, { message: `Processing Chapter ${chapterNumber} (${paths.length} pages)...`, type: 'info', timestamp: new Date().toLocaleTimeString() }]);
        
        const chaptersQuery = query(collection(db, `series/${seriesId}/chapters`), orderBy('chapterNumber', 'desc'));
        const chaptersSnapshot = await getDocs(chaptersQuery);
        const existingChapter = chaptersSnapshot.docs.find(d => d.data().chapterNumber === chapterNumber);
        
        let chapterId = '';
        if (existingChapter) {
          chapterId = existingChapter.id;
          setSmartImportLog(prev => [...prev, { message: `Updating existing Chapter ${chapterNumber}`, type: 'warning', timestamp: new Date().toLocaleTimeString() }]);
        } else {
          const chapRef = await addDoc(collection(db, `series/${seriesId}/chapters`), {
            seriesId: seriesId,
            chapterNumber: chapterNumber,
            title: `Chapter ${chapterNumber}`,
            content: [],
            publishDate: Timestamp.now(),
            views: 0,
            pageCount: paths.length,
          });
          chapterId = chapRef.id;
        }

        setSmartImportLog(prev => [...prev, { message: `Compressing and uploading pages...`, type: 'info', timestamp: new Date().toLocaleTimeString() }]);
        
        const pagesRef = collection(db, `series/${seriesId}/chapters/${chapterId}/pages`);
        
        if (existingChapter) {
          const existingPagesSnapshot = await getDocs(pagesRef);
          let batch = writeBatch(db);
          let opCount = 0;
          for (const doc of existingPagesSnapshot.docs) {
            batch.delete(doc.ref);
            opCount++;
            if (opCount >= 450) {
              await batch.commit();
              await new Promise(resolve => setTimeout(resolve, 500));
              batch = writeBatch(db);
              opCount = 0;
            }
          }
          if (opCount > 0) {
            await batch.commit();
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }

        let batch = writeBatch(db);
        let opCount = 0;
        let batchSizeBytes = 0;
        const MAX_BATCH_BYTES = 8 * 1024 * 1024; // Increased to 8MB to reduce number of batches
        
        let pageIndex = 0;
        const uploadedUrls: string[] = [];
        let useStorj = true;
        
        for (const path of paths) {
          if (cancelImportRef.current) throw new Error("Import cancelled by user.");
          const blob = await contents.files[path].async('blob');
          const file = new File([blob], path.split('/').pop()!, { type: blob.type });
          
          try {
            const base64Images = await splitAndCompressImage(file, 0.9);
            
            for (const base64 of base64Images) {
              const pageId = `page_${pageIndex.toString().padStart(4, '0')}`;
              
              if (useStorj) {
                try {
                  const storjUrl = await uploadToStorj(base64, `${seriesId}/${chapterId}/${pageId}.jpg`);
                  if (storjUrl) uploadedUrls.push(storjUrl);
                } catch (storjErr: any) {
                  if (storjErr.message.includes('credentials not fully configured')) {
                    useStorj = false;
                    setSmartImportLog(prev => [...prev, { message: `Storj not configured. Falling back to Firestore storage (Warning: may hit quota limits).`, type: 'info', timestamp: new Date().toLocaleTimeString() }]);
                  } else {
                    throw storjErr;
                  }
                }
              }
              
              if (!useStorj) {
                const approxBytes = base64.length;
                
                if (opCount >= 450 || (batchSizeBytes + approxBytes) >= MAX_BATCH_BYTES) {
                  if (opCount > 0) {
                    await batch.commit();
                    await new Promise(resolve => setTimeout(resolve, 500)); // Delay to prevent overloading
                  }
                  batch = writeBatch(db);
                  opCount = 0;
                  batchSizeBytes = 0;
                }
                
                batch.set(doc(pagesRef, pageId), {
                  pageNumber: pageIndex,
                  content: base64
                });
                opCount++;
                batchSizeBytes += approxBytes;
              }
              pageIndex++;
            }
          } catch (err: any) {
            setSmartImportLog(prev => [...prev, { message: `Error compressing ${file.name}: ${err.message}`, type: 'error', timestamp: new Date().toLocaleTimeString() }]);
          }
        }
        
        if (!useStorj && opCount > 0) {
          await batch.commit();
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        if (useStorj && uploadedUrls.length > 0) {
          await updateDoc(doc(db, `series/${seriesId}/chapters`, chapterId), {
            content: uploadedUrls,
            pageCount: uploadedUrls.length
          });
        } else {
          await updateDoc(doc(db, `series/${seriesId}/chapters`, chapterId), {
            pageCount: pageIndex
          });
        }
        
        setSmartImportLog(prev => [...prev, { message: `Chapter ${chapterNumber} completed.`, type: 'success', timestamp: new Date().toLocaleTimeString() }]);
      }
      
      await updateDoc(doc(db, 'series', seriesId), {
        lastUpdated: Timestamp.now()
      });
      
      setSmartImportLog(prev => [...prev, { message: `Smart Import completed successfully!`, type: 'success', timestamp: new Date().toLocaleTimeString() }]);
      
    } catch (err: any) {
      setSmartImportLog(prev => [...prev, { message: `CRITICAL ERROR: ${err.message}`, type: 'error', timestamp: new Date().toLocaleTimeString() }]);
    } finally {
      setIsSmartImporting(false);
      setSmartImportFile(null);
      setFormData({
        title: '', description: '', coverImage: '', backgroundImage: '', status: 'Ongoing', type: 'Manga', genres: [], tags: [], author: '', artist: '', releaseYear: new Date().getFullYear(), slug: ''
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSmartImportMode && smartImportFile) {
      setIsModalOpen(false);
      await handleSingleSeriesSmartImport();
      return;
    }

    const slug = formData.slug || await generateSlug(formData.title);
    const data = {
      ...formData,
      slug,
      rating: editingSeries?.rating || 0,
      ratingCount: editingSeries?.ratingCount || 0,
      views: editingSeries?.views || 0,
      dailyViews: 0,
      weeklyViews: 0,
      monthlyViews: 0,
      lastUpdated: Timestamp.now(),
    };

    try {
      if (editingSeries) {
        await updateDoc(doc(db, 'series', editingSeries.id), data);
      } else {
        // Use slug as document ID for easier retrieval
        await setDoc(doc(db, 'series', slug), data);
      }
      setIsModalOpen(false);
      setEditingSeries(null);
      setFormData({
        title: '',
        description: '',
        coverImage: '',
        backgroundImage: '',
        status: 'Ongoing',
        type: 'Manga',
        genres: [],
        tags: [],
        author: '',
        artist: '',
        releaseYear: new Date().getFullYear(),
        slug: '',
      });
    } catch (error) {
      console.error("Error saving series:", error);
    }
  };

  const handleDelete = async (id: string) => {
    setSeriesToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (seriesToDelete) {
      console.log("Attempting to delete series with ID:", seriesToDelete);
      try {
        await deleteDoc(doc(db, 'series', seriesToDelete));
        console.log("Successfully deleted series:", seriesToDelete);
        setIsDeleteModalOpen(false);
        setSeriesToDelete(null);
      } catch (error) {
        console.error("Error deleting series:", error);
        alert("Failed to delete series. Please check your console for details.");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Series Management</h1>
          <p className="text-zinc-500 font-medium">Add, edit, and manage all reading works on GENZ.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-auto">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select 
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full sm:w-auto bg-white border border-zinc-200 rounded-2xl py-2.5 pl-10 pr-8 text-sm outline-none appearance-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Types</option>
              <option value="Manga">Manga</option>
              <option value="Manhwa">Manhwa</option>
              <option value="Novel">Novel</option>
            </select>
          </div>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search series..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-white border border-zinc-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
          <button 
            onClick={() => { 
              setEditingSeries(null); 
              setFormData({
                title: '', description: '', coverImage: '', backgroundImage: '', status: 'Ongoing', type: 'Manga', genres: [], tags: [], author: '', artist: '', releaseYear: new Date().getFullYear(), slug: ''
              });
              setIsSmartImportMode(false);
              setSmartImportFile(null);
              setIsModalOpen(true); 
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 transition-colors w-full sm:w-auto whitespace-nowrap"
          >
            <Plus className="w-5 h-5" /> Add New Series
          </button>
          <button
            onClick={() => { 
              setEditingSeries(null); 
              setFormData({
                title: '', description: '', coverImage: '', backgroundImage: '', status: 'Ongoing', type: 'Manga', genres: [], tags: [], author: '', artist: '', releaseYear: new Date().getFullYear(), slug: ''
              });
              setIsSmartImportMode(true);
              setSmartImportFile(null);
              setIsModalOpen(true); 
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-zinc-900 text-white font-bold rounded-2xl hover:bg-zinc-800 transition-colors w-full sm:w-auto whitespace-nowrap"
          >
            <FileArchive className="w-5 h-5" /> Smart Bulk Import
          </button>
        </div>
      </div>

      {/* Series Table */}
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Series</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Type</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Views</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filteredSeries.map((series) => (
              <tr key={series.id} className="hover:bg-zinc-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <img src={series.coverImage || undefined} className="w-10 h-14 object-cover rounded-lg" alt="" referrerPolicy="no-referrer" />
                    <div>
                      <p className="font-bold">{series.title}</p>
                      <p className="text-xs text-zinc-500">{series.author}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {series.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${series.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                    {series.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold">{series.views.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => { setEditingSeries(series); setFormData({ ...series, backgroundImage: series.backgroundImage || '' }); setIsModalOpen(true); }}
                      className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(series.id)}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl">
            <div className="p-4 sm:p-8 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">{isSmartImportMode ? 'Smart Bulk Import Series' : (editingSeries ? 'Edit Series' : 'Add New Series')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 sm:p-8 space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Title</label>
                    <input 
                      type="text" 
                      required
                      value={formData.title}
                      onChange={e => {
                        const title = e.target.value;
                        setFormData({
                          ...formData, 
                          title
                        });
                      }}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Slug</label>
                    <input 
                      type="text" 
                      required
                      value={formData.slug}
                      onChange={e => setFormData({...formData, slug: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Type</label>
                      <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value as SeriesType})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none"
                      >
                        <option value="Manga">Manga</option>
                        <option value="Manhwa">Manhwa</option>
                        <option value="Novel">Novel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Status</label>
                      <select 
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as SeriesStatus})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none"
                      >
                        <option value="Ongoing">Ongoing</option>
                        <option value="Completed">Completed</option>
                        <option value="Hiatus">Hiatus</option>
                        <option value="Dropped">Dropped</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Description</label>
                    <textarea 
                      rows={4}
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Genres</label>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map(genre => (
                        <button
                          key={genre}
                          type="button"
                          onClick={() => {
                            const newGenres = formData.genres.includes(genre)
                              ? formData.genres.filter(g => g !== genre)
                              : [...formData.genres, genre];
                            setFormData({...formData, genres: newGenres});
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.genres.includes(genre) ? 'bg-emerald-500 text-black' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'}`}
                        >
                          {genre}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Cover Image</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-4">
                        <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-zinc-400 text-sm flex items-center truncate">
                          {formData.coverImage ? 'Image uploaded' : 'No image uploaded'}
                        </div>
                        <label className="p-3 bg-zinc-100 rounded-2xl text-zinc-500 hover:bg-zinc-200 cursor-pointer transition-colors relative">
                          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            disabled={isUploading}
                            onChange={(e) => handleFileUpload(e, 'coverImage')}
                          />
                        </label>
                      </div>
                      {isUploading && (
                        <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 animate-pulse" style={{ width: '100%' }} />
                        </div>
                      )}
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Upload a file from your device</p>
                    </div>
                    {formData.coverImage && (
                      <div className="relative mt-4 w-32 h-44 group">
                        <img src={formData.coverImage || undefined} className="w-full h-full object-cover rounded-2xl border border-zinc-200 shadow-lg" alt="Preview" referrerPolicy="no-referrer" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, coverImage: ''})}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Background Image (Optional)</label>
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-4">
                        <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 text-zinc-400 text-sm flex items-center truncate">
                          {formData.backgroundImage ? 'Image uploaded' : 'No image uploaded'}
                        </div>
                        <label className="p-3 bg-zinc-100 rounded-2xl text-zinc-500 hover:bg-zinc-200 cursor-pointer transition-colors relative">
                          {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            disabled={isUploading}
                            onChange={(e) => handleFileUpload(e, 'backgroundImage')}
                          />
                        </label>
                      </div>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Used for the series detail page header</p>
                    </div>
                    {formData.backgroundImage && (
                      <div className="relative mt-4 w-full h-32 group">
                        <img src={formData.backgroundImage || undefined} className="w-full h-full object-cover rounded-2xl border border-zinc-200 shadow-lg" alt="Preview" referrerPolicy="no-referrer" />
                        <button 
                          type="button"
                          onClick={() => setFormData({...formData, backgroundImage: ''})}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Author</label>
                      <input 
                        type="text" 
                        value={formData.author}
                        onChange={e => setFormData({...formData, author: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Artist</label>
                      <input 
                        type="text" 
                        value={formData.artist}
                        onChange={e => setFormData({...formData, artist: e.target.value})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Release Year</label>
                      <input 
                        type="number" 
                        value={formData.releaseYear}
                        onChange={e => setFormData({...formData, releaseYear: parseInt(e.target.value)})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Tags (comma separated)</label>
                      <input 
                        type="text" 
                        value={formData.tags.join(', ')}
                        onChange={e => setFormData({...formData, tags: e.target.value.split(',').map(t => t.trim()).filter(t => t !== '')})}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none"
                        placeholder="action, fantasy, magic"
                      />
                    </div>
                  </div>
                  {isSmartImportMode && (
                    <div className="pt-4 border-t border-zinc-100">
                      <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Chapters ZIP File</label>
                      <input 
                        type="file" 
                        accept=".zip"
                        ref={smartZipInputRef}
                        required={isSmartImportMode}
                        onChange={e => setSmartImportFile(e.target.files?.[0] || null)}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 outline-none"
                      />
                      <p className="text-[10px] text-zinc-400 mt-2">Upload a ZIP file containing the chapters. Folders will be parsed as chapters.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-zinc-100">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full sm:w-auto px-8 py-3 text-zinc-500 font-bold hover:bg-zinc-100 rounded-2xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-12 py-3 bg-black text-white font-bold rounded-2xl hover:bg-zinc-800 transition-colors"
                >
                  {isSmartImportMode ? 'Start Import' : (editingSeries ? 'Update Series' : 'Create Series')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Delete Series?</h3>
              <p className="text-zinc-500 font-medium">This action cannot be undone. All chapters and data associated with this series will be lost.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 bg-zinc-100 text-zinc-500 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Smart Import Modal */}
      <AnimatePresence>
        {isSmartImportModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <FileArchive className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black tracking-tight">Smart Bulk Import</h2>
                    <p className="text-sm text-zinc-500 font-medium">Processing zip archive...</p>
                  </div>
                </div>
                {!isSmartImporting && (
                  <button
                    onClick={() => setIsSmartImportModalOpen(false)}
                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-zinc-50/30">
                <div className="space-y-3 font-mono text-sm">
                  {smartImportLog.map((log, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl border ${
                        log.type === 'error'
                          ? 'bg-red-50 border-red-100 text-red-700'
                          : log.type === 'success'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
                          : log.type === 'warning'
                          ? 'bg-amber-50 border-amber-100 text-amber-700'
                          : 'bg-white border-zinc-200 text-zinc-700'
                      }`}
                    >
                      <span className="opacity-50 mr-3 text-xs">[{log.timestamp}]</span>
                      {log.message}
                    </div>
                  ))}
                  {isSmartImporting && (
                    <div className="flex items-center gap-3 text-zinc-500 p-3">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-zinc-100 bg-white flex justify-end">
                {isSmartImporting ? (
                  <button
                    onClick={() => {
                      cancelImportRef.current = true;
                    }}
                    className="px-6 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors"
                  >
                    Cancel Import
                  </button>
                ) : (
                  <button
                    onClick={() => setIsSmartImportModalOpen(false)}
                    className="px-6 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
