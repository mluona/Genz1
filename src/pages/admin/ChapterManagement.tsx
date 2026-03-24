import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy, setDoc, getDocs, writeBatch, waitForPendingWrites, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Series, Chapter } from '../../types';
import { compressImage, splitAndCompressImage } from '../../utils/imageCompression';
import { uploadToStorj } from '../../utils/storjUpload';
import { handleFirestoreError, OperationType } from '../../utils/firestore';
import { 
  Plus, Edit2, Trash2, X, Upload, Image as ImageIcon, 
  Layers, Loader2, FileArchive, AlertCircle, ArrowUp, 
  ArrowDown, Search, Filter, ChevronRight, Check, 
  GripVertical, ExternalLink, RefreshCw, Type, Globe, Lock, Coins
} from 'lucide-react';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { getProxiedImageUrl } from '../../utils/imageUtils';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const ChapterManagement: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    chapterNumber: 1,
    title: '',
    content: [] as string[],
    publishDate: new Date().toISOString().split('T')[0],
    isPremium: false,
    coinPrice: 0,
  });

  // UI States
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [failedUploads, setFailedUploads] = useState<{name: string, error: string, index: number}[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [totalFilesToUpload, setTotalFilesToUpload] = useState(0);
  const [completedFilesCount, setCompletedFilesCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [savingProgress, setSavingProgress] = useState({ current: 0, total: 0, status: '' });
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);

  // Smart Import States
  const [isSmartImportModalOpen, setIsSmartImportModalOpen] = useState(false);
  const [isSmartImporting, setIsSmartImporting] = useState(false);
  const [smartImportLog, setSmartImportLog] = useState<string[]>([]);
  const [importType, setImportType] = useState<'zip' | 'url'>('zip');
  
  const [isUrlImportModalOpen, setIsUrlImportModalOpen] = useState(false);
  const [urlImportInput, setUrlImportInput] = useState('');
  const [urlImportSourceId, setUrlImportSourceId] = useState('');
  const [isUrlImporting, setIsUrlImporting] = useState(false);
  const [sources, setSources] = useState<any[]>([]);
  const cancelImportRef = useRef(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  const smartZipInputRef = useRef<HTMLInputElement>(null);

  // Fetch Sources
  useEffect(() => {
    const q = query(collection(db, 'import_sources'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSources(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (error) => handleFirestoreError(error, OperationType.GET, 'import_sources'));
    return () => unsubscribe();
  }, []);

  // Fetch Series
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'series'), (snapshot) => {
      const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Series));
      setSeriesList(list);
      
      // Auto-select from URL or first available
      const seriesId = searchParams.get('seriesId');
      if (seriesId) {
        const found = list.find(s => s.id === seriesId);
        if (found) setSelectedSeries(found);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, 'series'));
    return () => unsubscribe();
  }, [searchParams]);

  // Fetch Chapters
  useEffect(() => {
    if (!selectedSeries) {
      setChapters([]);
      return;
    }

    const q = query(collection(db, `series/${selectedSeries.id}/chapters`), orderBy('chapterNumber', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setChapters(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Chapter)));
    }, (error) => handleFirestoreError(error, OperationType.GET, `series/${selectedSeries.id}/chapters`));
    return () => unsubscribe();
  }, [selectedSeries]);

  // Common Upload Logic
  const uploadFiles = async (files: File[]) => {
    if (!selectedSeries) return;
    setIsUploading(true);
    setError(null);
    setUploadProgress({});
    setFailedUploads([]);
    setTotalFilesToUpload(files.length);
    setCompletedFilesCount(0);

    // Pre-allocate slots with unique temporary IDs to track them
    const startIndex = formData.content.length;
    const placeholders = files.map(f => `uploading-${f.name}-${Date.now()}`);
    setFormData(prev => ({ ...prev, content: [...prev.content, ...placeholders] }));

    const CONCURRENCY_LIMIT = 6; // Increased from 3
    const tasks = files.map((file, i) => ({ file, fileId: placeholders[i], i }));

    const runTask = async (task: { file: File, fileId: string, i: number }) => {
      const { file, fileId, i } = task;
      try {
        console.log(`Starting compression for: ${file.name}`, {
          size: (file.size / 1024).toFixed(2) + ' KB',
          type: file.type
        });
        
        // Compress and split image if it's a long strip
        const base64Images = await splitAndCompressImage(file, 0.9);
        
        console.log(`Successfully compressed and split into ${base64Images.length} parts: ${file.name}`);
        
        setFormData(prev => {
          const newContent = [...prev.content];
          const placeholderIndex = newContent.indexOf(fileId);
          if (placeholderIndex !== -1) {
            newContent.splice(placeholderIndex, 1, ...base64Images);
          }
          return { ...prev, content: newContent };
        });
        
        setCompletedFilesCount(prev => prev + 1);
        setUploadProgress(prev => ({ ...prev, [fileId]: 100 }));
        
      } catch (err: any) {
        console.error(`Compression error for ${file.name}:`, err);
        setFailedUploads(prev => [...prev, { 
          name: file.name, 
          error: err.message || 'Unknown error',
          index: startIndex + i
        }]);

        // Remove the placeholder for failed uploads
        setFormData(prev => ({
          ...prev,
          content: prev.content.filter(item => item !== fileId)
        }));
      }
    };

    // Process in chunks
    for (let i = 0; i < tasks.length; i += CONCURRENCY_LIMIT) {
      const chunk = tasks.slice(i, i + CONCURRENCY_LIMIT);
      await Promise.all(chunk.map(runTask));
    }

    setIsUploading(false);
    setTotalFilesToUpload(0);
    setCompletedFilesCount(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
    uploadFiles(files);
  };

  const handleZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedSeries) return;

    setIsExtracting(true);
    setError(null);
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const imageFiles = Object.keys(contents.files)
        .filter(name => !contents.files[name].dir && /\.(jpe?g|png|gif|webp|avif|bmp|tiff?|jfif|svg)$/i.test(name))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      if (imageFiles.length === 0) {
        setError("No images found in ZIP.");
        setIsExtracting(false);
        return;
      }

      const files: File[] = [];
      for (const name of imageFiles) {
        const blob = await contents.files[name].async('blob');
        files.push(new File([blob], name.split('/').pop() || name, { type: blob.type }));
      }
      
      setIsExtracting(false);
      await uploadFiles(files);
    } catch (err: any) {
      setError(`ZIP Error: ${err.message}`);
      setIsExtracting(false);
    }
  };

  const handleUrlImport = async () => {
    if (!urlImportInput.trim() || !selectedSeries) return;
    
    setIsUrlImporting(true);
    setImportType('url');
    cancelImportRef.current = false;
    setSmartImportLog([`[${new Date().toLocaleTimeString()}] Starting URL Import for: ${urlImportInput}`]);
    setIsSmartImportModalOpen(true);
    setIsUrlImportModalOpen(false);
    
    try {
      const selectedSource = sources.find(s => s.id === urlImportSourceId);
      const sourceCookies = selectedSource?.cookies || '';
      const sourceUserAgent = selectedSource?.userAgent || '';
      
      const response = await fetch(`/api/scrape/auto?url=${encodeURIComponent(urlImportInput.trim())}&cookies=${encodeURIComponent(sourceCookies)}&userAgent=${encodeURIComponent(sourceUserAgent)}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.details || data.error || `Server returned ${response.status}`);
      
      let chaptersToImport = [];
      
      if (data.type === 'chapter') {
        chaptersToImport.push(data);
        setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Found single chapter.`]);
      } else if (data.type === 'series' && data.chapters) {
        chaptersToImport = data.chapters;
        setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Found series with ${chaptersToImport.length} chapters.`]);
      } else {
        throw new Error(`Unsupported URL type: ${data.type}. Please provide a direct chapter or series URL.`);
      }
      
      const existingChaptersSnap = await getDocs(collection(db, 'series', selectedSeries.id, 'chapters'))
        .catch(e => handleFirestoreError(e, OperationType.GET, `series/${selectedSeries.id}/chapters`));
      
      if (!existingChaptersSnap) return;
      const existingChapters = existingChaptersSnap.docs.map(d => d.data().chapterNumber);
      
      const missingChapters = chaptersToImport.filter(ch => {
        let chapterNumber = existingChapters.length > 0 ? Math.max(...existingChapters) + 1 : 1;
        if (ch.title) {
          const numMatch = ch.title.match(/(\d+(\.\d+)?)/);
          if (numMatch) chapterNumber = parseFloat(numMatch[1]);
        }
        return !existingChapters.includes(chapterNumber);
      });

      setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Found ${missingChapters.length} new chapters to import.`]);

      for (const ch of chaptersToImport) {
        if (cancelImportRef.current) {
          setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Import cancelled by user.`]);
          break;
        }

        // If it's a series import, we need to fetch chapter details first
        let chData = ch;
        if (data.type === 'series') {
          setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Fetching content for: ${ch.title}...`]);
          const chRes = await fetch(`/api/scrape/auto?url=${encodeURIComponent(ch.url)}&cookies=${encodeURIComponent(data.cookies || sourceCookies)}&userAgent=${encodeURIComponent(sourceUserAgent)}`);
          chData = await chRes.json();
          if (!chRes.ok) {
            setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error fetching ${ch.title}: ${chData.details || chRes.statusText}`]);
            continue;
          }
        }
        
        const isNovel = selectedSeries.type === 'Novel';
        
        if (isNovel) {
          if (!chData.content) {
            setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] No text content found for ${chData.title || 'Chapter'}. Skipping.`]);
            continue;
          }
        } else {
          if (!chData.images || chData.images.length === 0) {
            setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] No images found for ${chData.title || 'Chapter'}. Skipping.`]);
            continue;
          }
        }
        
        // Determine chapter number
        let chapterNumber = existingChapters.length > 0 ? Math.max(...existingChapters) + 1 : 1;
        if (chData.title) {
          const numMatch = chData.title.match(/(\d+(\.\d+)?)/);
          if (numMatch) chapterNumber = parseFloat(numMatch[1]);
        }
        
        if (existingChapters.includes(chapterNumber)) {
          setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Chapter ${chapterNumber} already exists. Skipping.`]);
          continue;
        }
        
        setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Importing Chapter ${chapterNumber}...`]);
        
        const chapRef = await addDoc(collection(db, 'series', selectedSeries.id, 'chapters'), {
          seriesId: selectedSeries.id,
          title: chData.title || `Chapter ${chapterNumber}`,
          chapterNumber,
          content: isNovel ? [chData.content] : [],
          pageCount: isNovel ? (chData.content.split(/\s+/).filter(Boolean).length || 0) : 0,
          publishDate: Timestamp.now(),
          views: 0
        }).catch(e => handleFirestoreError(e, OperationType.CREATE, `series/${selectedSeries.id}/chapters`));
        
        if (!chapRef) continue;
        
        if (!isNovel && chData.images) {
          let useStorj = true;
          const uploadedUrls: string[] = [];

          try {
            const processImage = async (imgUrl: string, index: number) => {
              try {
                const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imgUrl)}&referer=${encodeURIComponent(chData.url || urlImportInput)}&cookies=${encodeURIComponent(chData.cookies || data.cookies || sourceCookies)}`;
                const imgResponse = await fetch(proxyUrl);
                if (!imgResponse.ok) throw new Error(`Failed to fetch image: ${imgResponse.status}`);
                
                const blob = await imgResponse.blob();
                setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Compressing image ${index + 1}/${chData.images.length}...`]);
                const compressedSlices = await splitAndCompressImage(blob);
                
                if (useStorj) {
                  setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Uploading image ${index + 1} to Storj...`]);
                  const sliceUrls = await Promise.all(compressedSlices.map(async (slice, sliceIndex) => {
                    const filename = `${selectedSeries.id}/${chapRef.id}/page_${index}_slice_${sliceIndex}_${Date.now()}.jpg`;
                    return await uploadToStorj(slice, filename);
                  }));
                  return { index, urls: sliceUrls };
                } else {
                  // Fallback to Firestore (handled outside this function if useStorj becomes false)
                  throw new Error('Storj disabled');
                }
              } catch (err: any) {
                setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error processing image ${index + 1}: ${err.message}`]);
                throw err;
              }
            };

            const CONCURRENCY_LIMIT = 6; // Increased from 3
            const results = [];
            for (let i = 0; i < chData.images.length; i += CONCURRENCY_LIMIT) {
              const chunk = chData.images.slice(i, i + CONCURRENCY_LIMIT);
              const chunkResults = await Promise.all(chunk.map((url, j) => processImage(url, i + j)));
              results.push(...chunkResults);
            }

            results.sort((a, b) => a.index - b.index);
            const allUrls = results.flatMap(r => r.urls);
            await updateDoc(chapRef, { content: allUrls, pageCount: allUrls.length })
              .catch(e => handleFirestoreError(e, OperationType.UPDATE, `series/${selectedSeries.id}/chapters/${chapRef.id}`));
            
          } catch (err: any) {
            setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Storj upload failed for chapter, falling back to Firestore subcollection...`]);
            useStorj = false;
            
            // Re-process for Firestore if needed (sequential for safety with batches)
            let pageIndex = 0;
            const batch = writeBatch(db);
            for (let i = 0; i < chData.images.length; i++) {
              const imgUrl = chData.images[i];
              try {
                const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imgUrl)}&referer=${encodeURIComponent(chData.url || urlImportInput)}&cookies=${encodeURIComponent(chData.cookies || data.cookies || sourceCookies)}`;
                const imgResponse = await fetch(proxyUrl);
                if (!imgResponse.ok) continue;
                const blob = await imgResponse.blob();
                const compressedSlices = await splitAndCompressImage(blob);
                for (const slice of compressedSlices) {
                  const pageId = `page_${pageIndex.toString().padStart(4, '0')}`;
                  const pageRef = doc(collection(db, 'series', selectedSeries.id, 'chapters', chapRef.id, 'pages'), pageId);
                  batch.set(pageRef, { chapterId: chapRef.id, pageNumber: pageIndex, content: slice });
                  pageIndex++;
                }
              } catch (e) {}
            }
            await batch.commit()
              .catch(e => handleFirestoreError(e, OperationType.WRITE, `series/${selectedSeries.id}/chapters/${chapRef.id}/pages`));
            await updateDoc(chapRef, { pageCount: pageIndex })
              .catch(e => handleFirestoreError(e, OperationType.UPDATE, `series/${selectedSeries.id}/chapters/${chapRef.id}`));
          }
        }
        
        existingChapters.push(chapterNumber);
        setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Successfully imported Chapter ${chapterNumber}.`]);
      }
      
      setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] URL Import complete.`]);
    } catch (error: any) {
      setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] URL Import failed: ${error.message}`]);
      if (error.message.includes('Cloudflare')) {
        setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Opening target URL in a new tab so you can solve the challenge and copy fresh cookies.`]);
        window.open(urlImportInput, '_blank');
      }
    } finally {
      setIsUrlImporting(false);
      setIsSmartImporting(false);
      setUrlImportInput('');
    }
  };

  const handleSmartZipUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSmartImportModalOpen(true);
    setIsSmartImporting(true);
    setImportType('zip');
    setSmartImportLog([`[${new Date().toLocaleTimeString()}] Starting Smart Import from ${file.name}...`]);
    
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      const imageFiles = Object.keys(contents.files)
        .filter(name => !contents.files[name].dir && /\.(jpe?g|png|gif|webp|avif|bmp|tiff?|jfif|svg)$/i.test(name))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

      if (imageFiles.length === 0) {
        setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: No images found in ZIP.`]);
        setIsSmartImporting(false);
        return;
      }

      setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Found ${imageFiles.length} images. Parsing structure...`]);

      // Group images by Series -> Chapter
      const structure: Record<string, Record<string, string[]>> = {};
      
      for (const path of imageFiles) {
        const parts = path.split('/').filter(Boolean);
        const filename = parts.pop()!;
        
        let seriesName = 'Unknown Series';
        let chapterStr = '1';

        if (parts.length === 0) {
          // Just files in root
          if (selectedSeries) seriesName = selectedSeries.title;
        } else if (parts.length === 1) {
          // Could be Series or Chapter
          const match = parts[0].match(/(?:chapter|ch|chap|ep|episode)\s*(\d+(\.\d+)?)/i) || parts[0].match(/^(\d+(\.\d+)?)$/);
          if (match) {
            if (selectedSeries) seriesName = selectedSeries.title;
            chapterStr = match[1];
          } else {
            seriesName = parts[0];
          }
        } else {
          seriesName = parts[0];
          const chapDir = parts[1];
          const match = chapDir.match(/(?:chapter|ch|chap|ep|episode)\s*(\d+(\.\d+)?)/i) || chapDir.match(/^(\d+(\.\d+)?)$/);
          if (match) {
            chapterStr = match[1];
          } else {
            chapterStr = chapDir;
          }
        }

        if (!structure[seriesName]) structure[seriesName] = {};
        if (!structure[seriesName][chapterStr]) structure[seriesName][chapterStr] = [];
        structure[seriesName][chapterStr].push(path);
      }

      // Process each series
      for (const [seriesName, chaptersObj] of Object.entries(structure)) {
        setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Processing series: ${seriesName}`]);
        
        // Find or create series
        let seriesId = '';
        const existingSeries = seriesList.find(s => s.title.toLowerCase() === seriesName.toLowerCase());
        
        if (existingSeries) {
          seriesId = existingSeries.id;
          setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Found existing series: ${seriesName}`]);
        } else {
          setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Creating new series: ${seriesName}`]);
          const slug = seriesName.toLowerCase().trim().replace(/ /g, '-',).replace(/[^\w-]+/g, '') || `series-${Date.now()}`;
          const seriesRef = await addDoc(collection(db, 'series'), {
            title: seriesName,
            description: '',
            coverImage: '',
            type: 'Manga',
            status: 'Ongoing',
            genres: [],
            tags: [],
            views: 0,
            rating: 5,
            ratingCount: 1,
            lastUpdated: Timestamp.now(),
            slug,
            createdAt: Timestamp.now(),
          }).catch(e => handleFirestoreError(e, OperationType.CREATE, 'series'));
          
          if (!seriesRef) continue;
          seriesId = seriesRef.id;
        }

        // Process chapters
        for (const [chapterStr, paths] of Object.entries(chaptersObj)) {
          const chapterNumber = parseFloat(chapterStr) || 1;
          setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Processing Chapter ${chapterNumber} (${paths.length} pages)...`]);
          
          // Check if chapter exists
          const chaptersQuery = query(collection(db, `series/${seriesId}/chapters`), orderBy('chapterNumber', 'desc'));
          const chaptersSnapshot = await getDocs(chaptersQuery)
            .catch(e => handleFirestoreError(e, OperationType.GET, `series/${seriesId}/chapters`));
          
          if (!chaptersSnapshot) continue;
          const existingChapter = chaptersSnapshot.docs.find(d => d.data().chapterNumber === chapterNumber);
          
          let chapterId = '';
          if (existingChapter) {
            chapterId = existingChapter.id;
            setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Updating existing Chapter ${chapterNumber}`]);
          } else {
            const chapRef = await addDoc(collection(db, `series/${seriesId}/chapters`), {
              seriesId: seriesId,
              chapterNumber: chapterNumber,
              title: `Chapter ${chapterNumber}`,
              content: [],
              publishDate: Timestamp.now(),
              views: 0,
              pageCount: paths.length,
            }).catch(e => handleFirestoreError(e, OperationType.CREATE, `series/${seriesId}/chapters`));
            
            if (!chapRef) continue;
            chapterId = chapRef.id;
          }

          // Extract and compress images
          setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Compressing and uploading pages...`]);
          
          let useStorj = true;

          if (useStorj) {
            const uploadedUrls: string[] = [];
            let pageIndex = 0;
            
            // We'll process images in parallel, but maintain order
            const processImage = async (path: string, index: number) => {
              const blob = await contents.files[path].async('blob');
              const file = new File([blob], path.split('/').pop()!, { type: blob.type });
              try {
                setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Processing ${file.name}...`]);
                const base64Images = await splitAndCompressImage(file, 0.9);
                
                // Upload slices for this image
                const sliceUrls = await Promise.all(base64Images.map(async (base64, sliceIndex) => {
                  const filename = `${seriesId}/${chapterId}/page_${index}_slice_${sliceIndex}_${Date.now()}.jpg`;
                  return await uploadToStorj(base64, filename);
                }));
                
                return { index, urls: sliceUrls };
              } catch (err: any) {
                setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error processing ${file.name}: ${err.message}`]);
                throw err;
              }
            };

            try {
              const CONCURRENCY_LIMIT = 6; // Increased from 3
              const results = [];
              for (let i = 0; i < paths.length; i += CONCURRENCY_LIMIT) {
                const chunk = paths.slice(i, i + CONCURRENCY_LIMIT);
                const chunkResults = await Promise.all(chunk.map((path, j) => processImage(path, i + j)));
                results.push(...chunkResults);
              }
              
              // Sort results to maintain original order
              results.sort((a, b) => a.index - b.index);
              const allUrls = results.flatMap(r => r.urls);
              
              await updateDoc(doc(db, `series/${seriesId}/chapters`, chapterId), {
                content: allUrls,
                pageCount: allUrls.length
              }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `series/${seriesId}/chapters/${chapterId}`));
              
              // Clean up old pages if any
              const pagesRef = collection(db, `series/${seriesId}/chapters/${chapterId}/pages`);
              const existingPagesSnapshot = await getDocs(pagesRef)
                .catch(e => handleFirestoreError(e, OperationType.GET, `series/${seriesId}/chapters/${chapterId}/pages`));
              
              if (existingPagesSnapshot && !existingPagesSnapshot.empty) {
                let batch = writeBatch(db);
                let opCount = 0;
                for (const d of existingPagesSnapshot.docs) {
                  batch.delete(d.ref);
                  opCount++;
                  if (opCount >= 450) {
                    await batch.commit()
                      .catch(e => handleFirestoreError(e, OperationType.WRITE, `series/${seriesId}/chapters/${chapterId}/pages`));
                    batch = writeBatch(db);
                    opCount = 0;
                  }
                }
                if (opCount > 0) {
                  await batch.commit()
                    .catch(e => handleFirestoreError(e, OperationType.WRITE, `series/${seriesId}/chapters/${chapterId}/pages`));
                }
              }
            } catch (err: any) {
              setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Storj upload failed, falling back to Firestore: ${err.message}`]);
              useStorj = false;
            }
          }

          if (!useStorj) {
            const pagesRef = collection(db, `series/${seriesId}/chapters/${chapterId}/pages`);
            
            // Delete existing pages if updating
            if (existingChapter) {
              const existingPagesSnapshot = await getDocs(pagesRef)
                .catch(e => handleFirestoreError(e, OperationType.GET, `series/${seriesId}/chapters/${chapterId}/pages`));
              
              if (existingPagesSnapshot) {
                let batch = writeBatch(db);
              let opCount = 0;
              for (const doc of existingPagesSnapshot.docs) {
                batch.delete(doc.ref);
                opCount++;
                if (opCount >= 450) {
                  await batch.commit()
                    .catch(e => handleFirestoreError(e, OperationType.WRITE, `series/${seriesId}/chapters/${chapterId}/pages`));
                  batch = writeBatch(db);
                  opCount = 0;
                }
              }
              if (opCount > 0) {
                await batch.commit()
                  .catch(e => handleFirestoreError(e, OperationType.WRITE, `series/${seriesId}/chapters/${chapterId}/pages`));
              }
            }
          }

          // Upload new pages
          let batch = writeBatch(db);
            let opCount = 0;
            let batchSizeBytes = 0;
            const MAX_BATCH_BYTES = 8 * 1024 * 1024;
            
            let pageIndex = 0;
            for (const path of paths) {
              const blob = await contents.files[path].async('blob');
              const file = new File([blob], path.split('/').pop()!, { type: blob.type });
              
              try {
                const base64Images = await splitAndCompressImage(file, 0.9);
                
                for (const base64 of base64Images) {
                  const pageId = `page_${pageIndex.toString().padStart(4, '0')}`;
                  const approxBytes = base64.length;
                  
                  if (opCount >= 450 || (batchSizeBytes + approxBytes) >= MAX_BATCH_BYTES) {
                    await batch.commit()
                      .catch(e => handleFirestoreError(e, OperationType.WRITE, `series/${seriesId}/chapters/${chapterId}/pages`));
                    try {
                      await waitForPendingWrites(db);
                      await new Promise(resolve => setTimeout(resolve, 500));
                    } catch (e) {}
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
                  pageIndex++;
                }
              } catch (err: any) {
                setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error compressing ${file.name}: ${err.message}`]);
              }
            }
            
            if (opCount > 0) {
              await batch.commit()
                .catch(e => handleFirestoreError(e, OperationType.WRITE, `series/${seriesId}/chapters/${chapterId}/pages`));
              try {
                await waitForPendingWrites(db);
                await new Promise(resolve => setTimeout(resolve, 500));
              } catch (e) {}
            }
            
            // Update page count
            await updateDoc(doc(db, `series/${seriesId}/chapters`, chapterId), {
              pageCount: pageIndex
            }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `series/${seriesId}/chapters/${chapterId}`));
          }
          
          setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Chapter ${chapterNumber} completed.`]);
        }
        
        // Update series lastUpdated
        await updateDoc(doc(db, 'series', seriesId), {
          lastUpdated: Timestamp.now()
        }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `series/${seriesId}`));
      }
      
      setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Smart Import completed successfully!`]);
      
    } catch (err: any) {
      setSmartImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] CRITICAL ERROR: ${err.message}`]);
    } finally {
      setIsSmartImporting(false);
      if (smartZipInputRef.current) smartZipInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent, shouldContinue = false) => {
    if (e) e.preventDefault();
    if (!selectedSeries) return;
    setIsSaving(true);
    setError(null);

    const publishDate = new Date(formData.publishDate);
    
    // Separate content from chapterData for non-novels
    const isNovel = selectedSeries.type === 'Novel';
    const chapterData = {
      chapterNumber: parseFloat(formData.chapterNumber.toString()),
      title: formData.title,
      seriesId: selectedSeries.id,
      publishDate: Timestamp.fromDate(publishDate),
      views: editingChapter?.views || 0,
      content: isNovel ? formData.content : [], // Store empty array for non-novels in the main doc
      pageCount: isNovel ? (formData.content[0]?.split(/\s+/).filter(Boolean).length || 0) : formData.content.length,
      isPremium: formData.isPremium,
      coinPrice: formData.coinPrice,
    };

    try {
      let chapterId = editingChapter?.id;
      
      if (editingChapter) {
        await updateDoc(doc(db, `series/${selectedSeries.id}/chapters`, editingChapter.id), chapterData)
          .catch(e => handleFirestoreError(e, OperationType.UPDATE, `series/${selectedSeries.id}/chapters/${editingChapter.id}`));
      } else {
        try {
          const docRef = await addDoc(collection(db, `series/${selectedSeries.id}/chapters`), chapterData);
          chapterId = docRef.id;
        } catch (e) {
          handleFirestoreError(e, OperationType.CREATE, `series/${selectedSeries.id}/chapters`);
        }
        await updateDoc(doc(db, 'series', selectedSeries.id), { lastUpdated: Timestamp.now() })
          .catch(e => handleFirestoreError(e, OperationType.UPDATE, `series/${selectedSeries.id}`));
      }
      
      // Save pages to subcollection for non-novels
      if (chapterId && !isNovel) {
        let useStorj = true;
        let finalContent = [...formData.content];

        if (useStorj) {
          setSavingProgress({ current: 0, total: formData.content.length, status: 'Initializing...' });
          const uploadedUrls: string[] = new Array(formData.content.length);
          
          // 1. Batch presign all images
          const imagesToPresign = formData.content
            .map((content, i) => ({ content, i }))
            .filter(item => item.content.startsWith('data:image'));
          
          let presignedData: any[] = [];
          if (imagesToPresign.length > 0) {
            setSavingProgress(prev => ({ ...prev, status: 'Presigning images...' }));
            const presignResponse = await fetch('/api/storj-presign-batch', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                files: imagesToPresign.map(item => ({
                  filename: `${selectedSeries.id}/${chapterId}/page_${item.i}_${Date.now()}.jpg`,
                  contentType: 'image/jpeg'
                }))
              })
            });
            if (presignResponse.ok) {
              const { results } = await presignResponse.json();
              presignedData = results;
            }
            setSavingProgress(prev => ({ ...prev, status: 'Uploading to Cloud...' }));
          }

          // Concurrency limit for uploads
          const CONCURRENCY_LIMIT = 15;
          const uploadTasks = formData.content.map((content, i) => ({ content, i }));
          
          const runUploadTask = async (task: { content: string, i: number }) => {
            const { content, i } = task;
            if (content.startsWith('data:image')) {
              try {
                const preFetched = presignedData.find(p => p.filename.includes(`page_${i}_`));
                const url = await uploadToStorj(content, `page_${i}`, 'image/jpeg', undefined, preFetched);
                uploadedUrls[i] = url;
              } catch (err) {
                console.error(`Failed to upload page ${i} to Storj:`, err);
                throw err;
              }
            } else {
              uploadedUrls[i] = content;
            }
            setSavingProgress(prev => ({ ...prev, current: prev.current + 1 }));
          };

          try {
            // Process in chunks to limit concurrency
            for (let i = 0; i < uploadTasks.length; i += CONCURRENCY_LIMIT) {
              const chunk = uploadTasks.slice(i, i + CONCURRENCY_LIMIT);
              await Promise.all(chunk.map(runUploadTask));
            }
            
            finalContent = uploadedUrls.filter(Boolean);
            
            // Update the chapter document with the Storj URLs
            await updateDoc(doc(db, `series/${selectedSeries.id}/chapters`, chapterId), {
              content: finalContent
            }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `series/${selectedSeries.id}/chapters/${chapterId}`));
            
            // Clean up old pages in the pages subcollection to clean up
            const pagesRef = collection(db, `series/${selectedSeries.id}/chapters/${chapterId}/pages`);
            const existingPagesSnapshot = await getDocs(pagesRef)
              .catch(e => handleFirestoreError(e, OperationType.GET, `series/${selectedSeries.id}/chapters/${chapterId}/pages`));
            
            if (existingPagesSnapshot && !existingPagesSnapshot.empty) {
              let batch = writeBatch(db);
              let opCount = 0;
              for (const d of existingPagesSnapshot.docs) {
                batch.delete(d.ref);
                opCount++;
                if (opCount >= 450) {
                  await batch.commit()
                    .catch(e => handleFirestoreError(e, OperationType.WRITE, `series/${selectedSeries.id}/chapters/${chapterId}/pages`));
                  batch = writeBatch(db);
                  opCount = 0;
                }
              }
              if (opCount > 0) {
                await batch.commit()
                  .catch(e => handleFirestoreError(e, OperationType.WRITE, `series/${selectedSeries.id}/chapters/${chapterId}/pages`));
              }
            }
          } catch (err) {
            console.error("Storj parallel upload failed, falling back to Firestore:", err);
            useStorj = false;
          }
        }

        if (!useStorj) {
          // Fallback to Firestore subcollection
          const pagesRef = collection(db, `series/${selectedSeries.id}/chapters/${chapterId}/pages`);
          
          // First, let's get existing pages to delete any extras
          const existingPagesSnapshot = await getDocs(pagesRef)
            .catch(e => handleFirestoreError(e, OperationType.GET, `series/${selectedSeries.id}/chapters/${chapterId}/pages`));
          
          const existingPageIds = existingPagesSnapshot ? existingPagesSnapshot.docs.map(d => d.id) : [];
          
          // Save new pages and delete extra pages in batches (max 500 ops or 8MB per batch)
          const newPageIds = new Set<string>();
          let batch = writeBatch(db);
          let opCount = 0;
          let batchSizeBytes = 0;
          const MAX_BATCH_BYTES = 8 * 1024 * 1024; // 8MB to be safe and prevent stream exhaustion
          
          const commitBatchIfNeeded = async (addedBytes = 0) => {
            if (opCount >= 450 || (batchSizeBytes + addedBytes) >= MAX_BATCH_BYTES) {
              await batch.commit()
                .catch(e => handleFirestoreError(e, OperationType.WRITE, `series/${selectedSeries.id}/chapters/${chapterId}/pages`));
              try {
                await waitForPendingWrites(db);
                await new Promise(resolve => setTimeout(resolve, 500)); // Give client time to breathe
              } catch (e) {
                console.warn("waitForPendingWrites failed or timed out", e);
              }
              batch = writeBatch(db);
              opCount = 0;
              batchSizeBytes = 0;
            }
            batchSizeBytes += addedBytes;
          };

          for (let i = 0; i < formData.content.length; i++) {
            const pageId = `page_${i.toString().padStart(4, '0')}`;
            newPageIds.add(pageId);
            
            const content = formData.content[i];
            // Approximate size of the document (base64 string length + some overhead)
            const approxBytes = content ? content.length : 100;
            
            await commitBatchIfNeeded(approxBytes);
            
            batch.set(doc(pagesRef, pageId), {
              pageNumber: i,
              content: content
            });
            opCount++;
          }
          
          // Delete extra pages
          for (const oldId of existingPageIds) {
            if (!newPageIds.has(oldId)) {
              await commitBatchIfNeeded(100); // Small overhead for delete
              batch.delete(doc(pagesRef, oldId));
              opCount++;
            }
          }
          
          if (opCount > 0) {
            await batch.commit()
              .catch(e => handleFirestoreError(e, OperationType.WRITE, `series/${selectedSeries.id}/chapters/${chapterId}/pages`));
            try {
              await waitForPendingWrites(db);
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (e) {
              console.warn("waitForPendingWrites failed or timed out", e);
            }
          }
        }
      }
      
      if (editingChapter) {
        setSuccess("Chapter updated successfully!");
      } else {
        setSuccess("Chapter created successfully!");
      }
      
      if (shouldContinue) {
        const nextNum = chapterData.chapterNumber + 1;
        setFormData({
          chapterNumber: nextNum,
          title: '',
          content: [],
          publishDate: new Date().toISOString().split('T')[0],
          isPremium: false,
          coinPrice: 0,
        });
        setEditingChapter(null);
      } else {
        setIsEditorOpen(false);
        setEditingChapter(null);
        resetForm();
      }
    } catch (err: any) {
      setError(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const resetForm = () => {
    setFormData({
      chapterNumber: chapters.length > 0 ? chapters[0].chapterNumber + 1 : 1,
      title: '',
      content: [],
      publishDate: new Date().toISOString().split('T')[0],
      isPremium: false,
      coinPrice: 0,
    });
    setUploadProgress({});
    setFailedUploads([]);
    setSavingProgress({ current: 0, total: 0, status: '' });
  };

  const handleDelete = (id: string) => {
    if (!selectedSeries) return;
    setChapterToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedSeries || !chapterToDelete) return;
    try {
      // If it's not a novel, delete the pages subcollection first
      if (selectedSeries.type !== 'Novel') {
        const pagesRef = collection(db, `series/${selectedSeries.id}/chapters/${chapterToDelete}/pages`);
        const pagesSnapshot = await getDocs(pagesRef)
          .catch(e => handleFirestoreError(e, OperationType.GET, `series/${selectedSeries.id}/chapters/${chapterToDelete}/pages`));
        
        if (pagesSnapshot && !pagesSnapshot.empty) {
          let batch = writeBatch(db);
          let opCount = 0;
          
          for (const doc of pagesSnapshot.docs) {
            batch.delete(doc.ref);
            opCount++;
            if (opCount >= 450) {
              await batch.commit()
                .catch(e => handleFirestoreError(e, OperationType.DELETE, `series/${selectedSeries.id}/chapters/${chapterToDelete}/pages`));
              try {
                await waitForPendingWrites(db);
                await new Promise(resolve => setTimeout(resolve, 500));
              } catch (e) {
                console.warn("waitForPendingWrites failed or timed out", e);
              }
              batch = writeBatch(db);
              opCount = 0;
            }
          }
          
          if (opCount > 0) {
            await batch.commit()
              .catch(e => handleFirestoreError(e, OperationType.DELETE, `series/${selectedSeries.id}/chapters/${chapterToDelete}/pages`));
            try {
              await waitForPendingWrites(db);
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (e) {
              console.warn("waitForPendingWrites failed or timed out", e);
            }
          }
        }
      }
      
      // Delete the main chapter document
      await deleteDoc(doc(db, `series/${selectedSeries.id}/chapters`, chapterToDelete))
        .catch(e => handleFirestoreError(e, OperationType.DELETE, `series/${selectedSeries.id}/chapters/${chapterToDelete}`));
      setSuccess("Chapter deleted.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsDeleteModalOpen(false);
      setChapterToDelete(null);
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const openEditor = async (chapter?: Chapter) => {
    if (chapter) {
      let content = chapter.content || [];
      if (selectedSeries?.type !== 'Novel') {
        const pagesRef = collection(db, `series/${selectedSeries.id}/chapters/${chapter.id}/pages`);
        const pagesQuery = query(pagesRef, orderBy('pageNumber', 'asc'));
        const pagesSnapshot = await getDocs(pagesQuery)
          .catch(e => handleFirestoreError(e, OperationType.GET, `series/${selectedSeries.id}/chapters/${chapter.id}/pages`));
        
        if (pagesSnapshot && !pagesSnapshot.empty) {
          content = pagesSnapshot.docs.map(d => d.data().content);
        }
      }
      
      setEditingChapter(chapter);
      setFormData({
        chapterNumber: chapter.chapterNumber,
        title: chapter.title || '',
        content: content,
        publishDate: chapter.publishDate.toDate().toISOString().split('T')[0],
        isPremium: chapter.isPremium || false,
        coinPrice: chapter.coinPrice || 0,
      });
    } else {
      setEditingChapter(null);
      resetForm();
    }
    setIsEditorOpen(true);
  };

  const filteredChapters = chapters.filter(c => 
    c.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.chapterNumber.toString().includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-zinc-200 px-4 sm:px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
                Chapter Management
              </h1>
              <p className="text-[10px] sm:text-xs font-medium text-zinc-500 uppercase tracking-widest">Admin Control Panel</p>
            </div>
            
            <div className="hidden sm:block h-8 w-px bg-zinc-200 mx-2" />

            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hidden sm:inline">Active Series</span>
              <select 
                className="bg-zinc-100 border-none rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none w-full sm:min-w-[240px]"
                value={selectedSeries?.id || ''}
                onChange={(e) => setSelectedSeries(seriesList.find(s => s.id === e.target.value) || null)}
              >
                <option value="">Select a series...</option>
                {seriesList.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            {!isEditorOpen && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => smartZipInputRef.current?.click()}
                className="w-full sm:w-auto justify-center bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20"
              >
                <FileArchive className="w-4 h-4" /> Smart Bulk Import
              </motion.button>
            )}
            {selectedSeries && !isEditorOpen && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => {
                  if (isUrlImporting) {
                    setIsSmartImportModalOpen(true);
                  } else {
                    setIsUrlImportModalOpen(true);
                  }
                }}
                className="w-full sm:w-auto justify-center bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20"
              >
                {isUrlImporting ? (
                  <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> View Progress</>
                ) : (
                  <><Globe className="w-4 h-4" /> Import URL</>
                )}
              </motion.button>
            )}
            {selectedSeries && !isEditorOpen && (
              <motion.button 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => openEditor()}
                className="w-full sm:w-auto justify-center bg-emerald-500 text-black px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" /> New Chapter
              </motion.button>
            )}
          </div>
        </div>
      </header>

      <input type="file" accept=".zip" className="hidden" ref={smartZipInputRef} onChange={handleSmartZipUpload} />

      {isUrlImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsUrlImportModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-lg shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Import from URL</h2>
              <button 
                onClick={() => setIsUrlImportModalOpen(false)} 
                className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Chapter or Series URL</label>
                <input
                  type="url"
                  value={urlImportInput}
                  onChange={(e) => setUrlImportInput(e.target.value)}
                  placeholder="https://example.com/manga/chapter-1"
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <p className="text-xs text-zinc-500 mt-2">
                  Paste a direct link to a chapter or a series page from any supported site. The system will automatically scrape and import the content into the current series.
                </p>
              </div>
              
              {sources.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Source (Optional)</label>
                  <select
                    value={urlImportSourceId}
                    onChange={(e) => setUrlImportSourceId(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
                  >
                    <option value="">Auto-detect / No specific source</option>
                    {sources.map(source => {
                      let hostname = '';
                      try { hostname = new URL(source.url).hostname; } catch (e) {}
                      return (
                        <option key={source.id} value={source.id}>{source.name} {hostname ? `(${hostname})` : ''}</option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-zinc-500 mt-2">
                    Select a configured source to use its cookies and bypass protections like Cloudflare.
                  </p>
                </div>
              )}

              <button
                onClick={handleUrlImport}
                disabled={!urlImportInput.trim() || isUrlImporting}
                className="w-full py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-400 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isUrlImporting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <Globe className="w-5 h-5" />
                )}
                Start Import
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <main className="max-w-[1600px] mx-auto p-4 sm:p-8">
        <AnimatePresence mode="wait">
          {!selectedSeries ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-16 sm:py-32 text-center px-4"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                <Layers className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-300" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-400">No Series Selected</h2>
              <p className="text-zinc-500 mt-2 max-w-md">Please select a series from the dropdown above to start managing its chapters.</p>
            </motion.div>
          ) : isEditorOpen ? (
            <motion.div 
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Editor Sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-4 sm:p-8 rounded-[2rem] border border-zinc-200 shadow-sm space-y-6 sm:space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">Chapter Details</h3>
                    <button 
                      onClick={() => setIsEditorOpen(false)}
                      className="p-2 hover:bg-zinc-100 rounded-full transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Chapter Number</label>
                      <input 
                        type="number" 
                        step="0.1"
                        value={formData.chapterNumber}
                        onChange={e => setFormData(prev => ({ ...prev, chapterNumber: Number(e.target.value) }))}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Title (Optional)</label>
                      <input 
                        type="text" 
                        value={formData.title}
                        onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g. The Beginning of the End"
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Publish Date</label>
                      <input 
                        type="date" 
                        value={formData.publishDate}
                        onChange={e => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-10 h-6 rounded-full p-1 transition-colors ${formData.isPremium ? 'bg-amber-500' : 'bg-zinc-200'}`}>
                          <div className={`w-4 h-4 rounded-full bg-white transition-transform ${formData.isPremium ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-bold text-zinc-700">Premium Chapter</span>
                        </div>
                        <input 
                          type="checkbox" 
                          className="hidden"
                          checked={formData.isPremium}
                          onChange={e => setFormData(prev => ({ ...prev, isPremium: e.target.checked }))}
                        />
                      </label>

                      {formData.isPremium && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                            <Coins className="w-3 h-3" /> Coin Price
                          </label>
                          <input 
                            type="number" 
                            min="0"
                            value={formData.coinPrice}
                            onChange={e => setFormData(prev => ({ ...prev, coinPrice: Number(e.target.value) }))}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-amber-500/20"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-zinc-100 flex flex-col gap-3">
                    <button 
                      onClick={(e) => handleSubmit(e, false)}
                      disabled={isSaving || isUploading}
                      className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <div className="flex flex-col items-center gap-1">
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Saving...</span>
                          </div>
                          {savingProgress.total > 0 && (
                            <span className="text-[9px] font-bold text-zinc-400">
                              Uploading to Cloud: {savingProgress.current} / {savingProgress.total}
                            </span>
                          )}
                        </div>
                      ) : (
                        <><Check className="w-4 h-4" /> {editingChapter ? 'Update Chapter' : 'Save & Close'}</>
                      )}
                    </button>
                    {!editingChapter && (
                      <button 
                        onClick={(e) => handleSubmit(e, true)}
                        disabled={isSaving || isUploading}
                        className="w-full bg-emerald-500 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSaving ? (
                          <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>{savingProgress.status || 'Saving...'}</span>
                            </div>
                            {savingProgress.total > 0 && (
                              <span className="text-[9px] font-bold text-emerald-900/50">
                                {savingProgress.current} / {savingProgress.total}
                              </span>
                            )}
                          </div>
                        ) : (
                          <><Plus className="w-4 h-4" /> Save & Continue</>
                        )}
                      </button>
                    )}
                    <button 
                      onClick={() => setIsEditorOpen(false)}
                      className="w-full bg-zinc-100 text-zinc-500 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {/* Status Card */}
                {(isUploading || isExtracting || error || success || failedUploads.length > 0) && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "p-6 rounded-[2rem] border shadow-sm",
                      error || failedUploads.length > 0 ? "bg-red-50 border-red-100 text-red-600" : 
                      success ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                      "bg-blue-50 border-blue-100 text-blue-600"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {error || failedUploads.length > 0 ? <AlertCircle className="w-5 h-5" /> : 
                         success ? <Check className="w-5 h-5" /> :
                         <Loader2 className="w-5 h-5 animate-spin" />}
                        <span className="text-sm font-black uppercase tracking-tight">
                          {error || failedUploads.length > 0 ? 'Upload Issues' : success ? 'Success' : 'Processing...'}
                        </span>
                      </div>
                      {failedUploads.length > 0 && (
                        <button 
                          onClick={() => setFailedUploads([])}
                          className="text-[10px] font-black uppercase tracking-widest hover:underline"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    
                    {error && <p className="text-xs font-medium leading-relaxed mb-2">{error}</p>}
                    {success && <p className="text-xs font-medium leading-relaxed">{success}</p>}
                    
                    {failedUploads.length > 0 && (
                      <div className="space-y-2 mt-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                        {failedUploads.map((fail, i) => (
                          <div key={i} className="p-3 bg-white/50 rounded-xl border border-red-100">
                            <p className="text-[10px] font-black uppercase tracking-tight truncate">{fail.name}</p>
                            <p className="text-[9px] font-medium opacity-80 mt-1">{fail.error}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {isUploading && (
                      <div className="space-y-3 mt-4">
                        <div className="flex justify-between items-end">
                          <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                            Overall Progress
                          </p>
                          <p className="text-[10px] font-black">
                            {completedFilesCount} / {totalFilesToUpload}
                          </p>
                        </div>
                        <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all duration-500" 
                            style={{ width: `${(completedFilesCount / totalFilesToUpload) * 100}%` }} 
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>

              {/* Main Editor Area */}
              <div 
                className="lg:col-span-8 space-y-6 relative"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const files = Array.from(e.dataTransfer.files);
                  const zipFile = files.find(f => f.name.endsWith('.zip'));
                  if (zipFile) {
                    const mockEvent = { target: { files: [zipFile] } } as any;
                    handleZipUpload(mockEvent);
                  } else {
                    const imageFiles = files.filter(f => f.type.startsWith('image/'));
                    if (imageFiles.length > 0) uploadFiles(imageFiles);
                  }
                }}
              >
                <AnimatePresence>
                  {isDragging && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-50 bg-emerald-500/10 backdrop-blur-sm border-4 border-dashed border-emerald-500 rounded-[2rem] flex items-center justify-center"
                    >
                      <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4">
                        <Upload className="w-12 h-12 text-emerald-500 animate-bounce" />
                        <p className="text-xl font-black uppercase tracking-tight">Drop to Upload</p>
                        <p className="text-sm font-medium text-zinc-500">Images or ZIP files supported</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="bg-white p-4 sm:p-8 rounded-[2rem] border border-zinc-200 shadow-sm min-h-[400px] sm:min-h-[600px]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                    <div>
                      <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight">
                        {selectedSeries.type === 'Novel' ? 'Chapter Content' : 'Chapter Pages'}
                      </h3>
                      <p className="text-xs font-medium text-zinc-500 mt-1">
                        {selectedSeries.type === 'Novel' ? 'Write or paste your chapter text below.' : 'Upload images or ZIP files to add pages.'}
                      </p>
                    </div>

                    {selectedSeries.type !== 'Novel' && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            const newContent = [...formData.content].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
                            setFormData(prev => ({ ...prev, content: newContent }));
                          }}
                          className="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-zinc-500"
                          title="Sort Pages"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => setIsClearModalOpen(true)}
                          className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-400"
                          title="Clear All"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {selectedSeries.type === 'Novel' ? (
                    <div className="space-y-4">
                      <textarea 
                        value={formData.content[0] || ''}
                        onChange={e => setFormData(prev => ({ ...prev, content: [e.target.value] }))}
                        placeholder="Once upon a time..."
                        className="w-full min-h-[500px] bg-zinc-50 border border-zinc-200 rounded-3xl p-8 text-lg font-serif leading-relaxed outline-none focus:ring-4 focus:ring-emerald-500/5 resize-none"
                      />
                      <div className="flex justify-between items-center px-4">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          Word Count: {formData.content[0]?.split(/\s+/).filter(Boolean).length || 0}
                        </span>
                        <div className="flex items-center gap-2 text-zinc-400">
                          <Type className="w-4 h-4" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Rich Text Supported</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Upload Zones */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="group relative border-2 border-dashed border-zinc-200 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
                        >
                          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black uppercase tracking-tight">Upload Images</p>
                            <p className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-widest">JPG, PNG, WEBP, etc.</p>
                          </div>
                          <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                        </div>

                        <div 
                          onClick={() => zipInputRef.current?.click()}
                          className="group relative border-2 border-dashed border-zinc-200 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all cursor-pointer"
                        >
                          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileArchive className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-black uppercase tracking-tight">Upload ZIP</p>
                            <p className="text-[10px] font-medium text-zinc-400 mt-1 uppercase tracking-widest">Auto-extract images</p>
                          </div>
                          <input type="file" accept=".zip" className="hidden" ref={zipInputRef} onChange={handleZipUpload} />
                        </div>
                      </div>

                      {/* Page Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                        {formData.content.map((url, index) => (
                          <motion.div 
                            layout
                            key={`${url}-${index}`}
                            className="group relative aspect-[3/4] bg-zinc-100 rounded-2xl border border-zinc-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
                          >
                            {url && !url.startsWith('uploading-') ? (
                              <img src={getProxiedImageUrl(url)} className="w-full h-full object-cover" alt={`Page ${index + 1}`} referrerPolicy="no-referrer" />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-zinc-50">
                                <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">
                                  Uploading...
                                </span>
                              </div>
                            )}

                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                              <div className="flex items-center gap-2">
                                <button 
                                  onClick={() => {
                                    const newContent = [...formData.content];
                                    const target = index - 1;
                                    if (target >= 0) {
                                      [newContent[index], newContent[target]] = [newContent[target], newContent[index]];
                                      setFormData(prev => ({ ...prev, content: newContent }));
                                    }
                                  }}
                                  className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-colors"
                                >
                                  <ArrowUp className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => {
                                    const newContent = [...formData.content];
                                    const target = index + 1;
                                    if (target < newContent.length) {
                                      [newContent[index], newContent[target]] = [newContent[target], newContent[index]];
                                      setFormData(prev => ({ ...prev, content: newContent }));
                                    }
                                  }}
                                  className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white transition-colors"
                                >
                                  <ArrowDown className="w-4 h-4" />
                                </button>
                              </div>
                              <button 
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, content: prev.content.filter((_, i) => i !== index) }));
                                }}
                                className="px-4 py-2 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-red-600 transition-colors"
                              >
                                Remove
                              </button>
                            </div>

                            <div className="absolute top-3 left-3 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest">
                              Page {index + 1}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* List Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black tracking-tight">{selectedSeries.title}</h2>
                  <p className="text-zinc-500 font-medium mt-1">Manage {chapters.length} chapters for this series.</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="relative w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Search chapters..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="bg-white border border-zinc-200 rounded-2xl pl-12 pr-6 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-emerald-500/5 w-full md:w-80"
                    />
                  </div>
                </div>
              </div>

              {/* Chapter Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredChapters.map((chapter) => (
                  <motion.div 
                    layout
                    key={chapter.id}
                    className="group bg-white p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4 sm:mb-6">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-zinc-100 rounded-2xl flex items-center justify-center text-lg sm:text-xl font-black text-zinc-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                        #{chapter.chapterNumber}
                      </div>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openEditor(chapter);
                          }}
                          className="p-2 hover:bg-blue-50 text-zinc-400 hover:text-blue-500 rounded-xl transition-all relative z-10"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(chapter.id);
                          }}
                          className="p-2 hover:bg-red-50 text-zinc-400 hover:text-red-500 rounded-xl transition-all relative z-10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-black text-lg truncate">{chapter.title || `Chapter ${chapter.chapterNumber}`}</h4>
                          {chapter.isPremium && (
                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full shrink-0">
                              <Lock className="w-3 h-3" /> {chapter.coinPrice}
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                          Published {chapter.publishDate.toDate().toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="w-3 h-3 text-zinc-400" />
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            {chapter.pageCount ?? chapter.content?.length ?? 0} {selectedSeries.type === 'Novel' ? 'Words' : 'Pages'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ExternalLink className="w-3 h-3 text-zinc-400" />
                          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                            {chapter.views.toLocaleString()} Views
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <button 
                  onClick={() => openEditor()}
                  className="group aspect-square border-4 border-dashed border-zinc-200 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all text-zinc-300 hover:text-emerald-500"
                >
                  <div className="w-16 h-16 bg-zinc-100 rounded-3xl flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                    <Plus className="w-8 h-8" />
                  </div>
                  <span className="text-sm font-black uppercase tracking-widest">Add Chapter</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Delete Chapter?</h3>
              <p className="text-zinc-500 font-medium">This action cannot be undone. The chapter and all its pages will be permanently deleted.</p>
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

      {/* Clear Pages Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl p-8 space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight">Clear All Pages?</h3>
              <p className="text-zinc-500 font-medium">Are you sure you want to remove all pages from this chapter? You will need to re-upload them.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsClearModalOpen(false)}
                className="flex-1 py-3 bg-zinc-100 text-zinc-500 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  setFormData(prev => ({ ...prev, content: [] }));
                  setIsClearModalOpen(false);
                }}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Smart Import Modal */}
      <AnimatePresence>
        {isSmartImportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl p-8 space-y-6 border border-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl">
                    {importType === 'url' ? <Globe className="w-6 h-6" /> : <FileArchive className="w-6 h-6" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                      {importType === 'url' ? 'URL Import' : 'Smart Bulk Import'}
                    </h2>
                    <p className="text-zinc-400 text-sm font-medium">
                      {importType === 'url' ? 'Importing chapters from external source' : 'Automatically identifying series and chapters from ZIP'}
                    </p>
                  </div>
                </div>
                {(!isSmartImporting && !isUrlImporting) && (
                  <button 
                    onClick={() => setIsSmartImportModalOpen(false)} 
                    className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                )}
              </div>

              <div className="bg-black/50 rounded-2xl p-4 border border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-black uppercase tracking-tight text-sm">Import Console</h3>
                  {(isSmartImporting || isUrlImporting) && <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                </div>
                <div className="space-y-2 font-mono text-xs h-64 overflow-y-auto custom-scrollbar">
                  {smartImportLog.map((log, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="text-zinc-600">[{log.split('] ')[0].replace('[', '')}]</span>
                      <span className={log.includes('completed successfully') || log.includes('Found') ? 'text-emerald-400' : log.includes('Error') || log.includes('ERROR') ? 'text-red-400' : 'text-zinc-300'}>
                        {log.split('] ')[1]}
                      </span>
                    </div>
                  ))}
                  {smartImportLog.length === 0 && <p className="text-zinc-600 italic">Waiting for import task...</p>}
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-3">
                {isUrlImporting && (
                  <button 
                    onClick={() => { cancelImportRef.current = true; }}
                    className="px-6 py-3 bg-red-500/10 text-red-500 font-bold rounded-xl hover:bg-red-500/20 transition-colors"
                  >
                    Cancel Import
                  </button>
                )}
                <button 
                  onClick={() => setIsSmartImportModalOpen(false)}
                  disabled={isSmartImporting && !isUrlImporting}
                  className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {isSmartImporting || isUrlImporting ? 'Close (Runs in background)' : 'Close'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
