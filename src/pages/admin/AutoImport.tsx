import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Globe, Zap, Search, Plus, Trash2, Play, CheckCircle, AlertCircle, X, Edit2, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabase';
import axios from 'axios';
import { splitAndCompressImage } from '../../utils/imageCompression';
import { uploadToStorj } from '../../utils/storjUpload';

export const AutoImport: React.FC = () => {
  const [sources, setSources] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importLog, setImportLog] = useState<string[]>([]);
  const [rssItems, setRssItems] = useState<any[]>([]);
  const [scrapedData, setScrapedData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<any>(null);
  const [newSource, setNewSource] = useState({
    name: '',
    url: '',
    cookies: '',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  });
  const [isTesting, setIsTesting] = useState<string | null>(null);

  const fetchSources = async () => {
    const { data, error } = await supabase
      .from('import_sources')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error("Error fetching sources:", error);
      return;
    }
    setSources(data || []);
  };

  useEffect(() => {
    fetchSources();

    const channel = supabase
      .channel('import_sources_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'import_sources' }, () => {
        fetchSources();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSource) {
        const { error } = await supabase
          .from('import_sources')
          .update({
            ...newSource,
            lastUpdated: new Date().toISOString(),
          })
          .eq('id', editingSource.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('import_sources')
          .insert({
            ...newSource,
            type: 'Website',
            status: 'Active',
            lastSync: 'Never',
            createdAt: new Date().toISOString(),
          });
        if (error) throw error;
      }
      setIsModalOpen(false);
      setEditingSource(null);
      setNewSource({ name: '', url: '', cookies: '', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36' });
    } catch (error: any) {
      console.error("Error saving source:", error);
      alert("Failed to save source: " + error.message);
    }
  };

  const handleEditSource = (source: any) => {
    setEditingSource(source);
    setNewSource({ 
      name: source.name, 
      url: source.url,
      cookies: source.cookies || '',
      userAgent: source.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });
    setIsModalOpen(true);
  };

  const handleDeleteSource = async (id: string) => {
    try {
      const { error } = await supabase
        .from('import_sources')
        .delete()
        .eq('id', id);
      if (error) throw error;
    } catch (error: any) {
      console.error("Error deleting source:", error);
      alert("Failed to delete source: " + error.message);
    }
  };

  const handleTestConnection = async (source: any) => {
    setIsTesting(source.id);
    setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Testing connection to: ${source.name}...`]);
    
    try {
      const response = await fetch(`/api/scrape/auto?url=${encodeURIComponent(source.url)}&cookies=${encodeURIComponent(source.cookies || '')}&userAgent=${encodeURIComponent(source.userAgent || '')}`);
      const data = await response.json();
      
      if (response.ok) {
        setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Success: Connection established. Detected type: ${data.type}`]);
      } else {
        setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: ${data.details || data.error}`]);
      }
    } catch (error: any) {
      setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: Network failure.`]);
    } finally {
      setIsTesting(null);
    }
  };

  const handleRunImport = async (sourceId: string) => {
    const source = sources.find(s => s.id === sourceId);
    if (!source) return;

    setIsImporting(true);
    setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting deep scan of: ${source.name}...`]);
    
    try {
      const response = await fetch(`/api/scrape/auto?url=${encodeURIComponent(source.url)}`);
      const data = await response.json();
      setScrapedData(data);
      
      if (data.type === 'list') {
        setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Found ${data.series?.length || 0} series to import.`]);
      } else if (data.type === 'series') {
        setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Found series: ${data.title} with ${data.chapters?.length || 0} chapters.`]);
      } else {
        setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Scan complete. Type: ${data.type}`]);
      }
    } catch (error) {
      setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: Failed to scan website.`]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportSeries = async (seriesData: any) => {
    if (!seriesData.title) {
      setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: Series title not found. Skipping.`]);
      return;
    }

    setIsImporting(true);
    
    try {
      // 1. Check if series already exists
      const slug = seriesData.title.toLowerCase().trim().replace(/ /g, '-').replace(/[^\w-]+/g, '') || `series-${Date.now()}`;
      const { data: existingSeriesData, error: seriesFetchError } = await supabase
        .from('series')
        .select('*')
        .eq('slug', slug);
      
      if (seriesFetchError) throw seriesFetchError;
      
      let seriesId: string;
      let existingChapters: number[] = [];

      // Find the source this series belongs to (if any) to get its cookies
      const source = sources.find(src => {
        try {
          return seriesData.url && src.url && seriesData.url.includes(new URL(src.url).hostname);
        } catch (e) {
          return false;
        }
      });

      if (existingSeriesData && existingSeriesData.length > 0) {
        const existingDoc = existingSeriesData[0];
        seriesId = existingDoc.id;
        setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Series "${seriesData.title}" already exists. Checking for new chapters...`]);
        
        // Update sourceUrl if missing
        if (!existingDoc.sourceUrl && seriesData.url) {
          await supabase
            .from('series')
            .update({ sourceUrl: seriesData.url })
            .eq('id', seriesId);
        }

        // Get existing chapter numbers
        const { data: chaptersSnap, error: chaptersFetchError } = await supabase
          .from('chapters')
          .select('chapterNumber')
          .eq('seriesId', seriesId);
        
        if (chaptersFetchError) throw chaptersFetchError;
        
        if (chaptersSnap) {
          existingChapters = chaptersSnap.map(d => d.chapterNumber);
        }
      } else {
        setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Importing new series: ${seriesData.title}...`]);
        const { data: newSeries, error: seriesCreateError } = await supabase
          .from('series')
          .insert({
            title: seriesData.title,
            description: seriesData.description || '',
            coverImage: seriesData.coverImage || '',
            type: 'Manga',
            status: 'Ongoing',
            genres: [],
            tags: [],
            views: 0,
            rating: 5,
            ratingCount: 1,
            lastUpdated: new Date().toISOString(),
            slug,
            sourceUrl: seriesData.url || '',
            createdAt: new Date().toISOString(),
          })
          .select()
          .single();
        
        if (seriesCreateError || !newSeries) throw seriesCreateError || new Error("Failed to create series");
        seriesId = newSeries.id;
        setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Series created (ID: ${seriesId}).`]);
      }

      // 2. Import Chapters
      if (seriesData.chapters && seriesData.chapters.length > 0) {
        const newChapters = seriesData.chapters.filter((ch: any) => !existingChapters.includes(ch.chapterNumber));
        
        if (newChapters.length === 0) {
          setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] No new chapters found for ${seriesData.title}.`]);
        } else {
          setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Found ${newChapters.length} new chapters. Importing...`]);
          
          // Limit to first 20 new chapters to avoid timeouts
          const chaptersToImport = newChapters.slice(0, 20);
          
          for (const chapter of chaptersToImport) {
            let retryCount = 0;
            const maxRetries = 3;
            let success = false;

            while (retryCount < maxRetries && !success) {
              try {
                if (retryCount > 0) {
                  setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Retrying ${chapter.title} (Attempt ${retryCount + 1})...`]);
                  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s before retry
                } else {
                  setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Scraping chapter: ${chapter.title}...`]);
                }
                
                const chResponse = await fetch(`/api/scrape/auto?url=${encodeURIComponent(chapter.url)}&cookies=${encodeURIComponent(source?.cookies || '')}&userAgent=${encodeURIComponent(source?.userAgent || '')}`);
                const chData = await chResponse.json();

                if (!chResponse.ok) {
                  const errorMsg = chData.details || chData.error || `Server returned ${chResponse.status}`;
                  if (chResponse.status === 403) {
                    throw new Error(`Access Forbidden (403): ${errorMsg}. This site likely has Cloudflare protection. Try adding cookies/user-agent.`);
                  }
                  throw new Error(errorMsg);
                }
                
                // Update source cookies if we got new ones
                let currentCookies = source?.cookies || '';
                if (chData.cookies && chData.cookies !== currentCookies) {
                   currentCookies = chData.cookies;
                   if (source) {
                     await supabase
                       .from('import_sources')
                       .update({ cookies: currentCookies })
                       .eq('id', source.id);
                     source.cookies = currentCookies; // update local object
                   }
                }
                
                if (chData.images && chData.images.length > 0) {
                  const { data: newChapter, error: chapterCreateError } = await supabase
                    .from('chapters')
                    .insert({
                      seriesId: seriesId,
                      chapterNumber: chapter.chapterNumber,
                      title: chapter.title,
                      content: [],
                      publishDate: new Date().toISOString(),
                      views: 0,
                      pageCount: chData.images.length,
                    })
                    .select()
                    .single();
                  
                  if (chapterCreateError || !newChapter) throw chapterCreateError || new Error("Failed to create chapter");
                  const chapterId = newChapter.id;
                  setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Downloading and processing ${chData.images.length} pages for ${chapter.title}...`]);
                  
                  let pageIndex = 0;
                  const uploadedUrls: string[] = [];
                  let useStorj = true;
                  
                  // Fallback variables if Storj is not configured
                  const pagesToInsert = [];
                  
                  for (let i = 0; i < chData.images.length; i++) {
                    const imgUrl = chData.images[i];
                    try {
                      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imgUrl)}&referer=${encodeURIComponent(chapter.url)}&cookies=${encodeURIComponent(currentCookies)}`;
                      const imgResponse = await fetch(proxyUrl);
                      if (!imgResponse.ok) throw new Error(`Failed to fetch image: ${imgResponse.status}`);
                      
                      const blob = await imgResponse.blob();
                      const file = new File([blob], `page_${i}.jpg`, { type: blob.type });
                      
                      const base64Images = await splitAndCompressImage(file, 0.9);
                      
                      for (const base64 of base64Images) {
                        const pageId = `page_${pageIndex.toString().padStart(4, '0')}`;
                        
                        // Extract mime type from base64 string
                        const mimeTypeMatch = base64.match(/^data:(image\/[a-zA-Z+]+);base64,/);
                        const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
                        
                        if (useStorj) {
                          try {
                            const storjUrl = await uploadToStorj(base64, `${seriesId}/${chapterId}/${pageId}.jpg`, mimeType);
                            if (storjUrl) uploadedUrls.push(storjUrl);
                          } catch (storjErr: any) {
                            if (storjErr.message.includes('credentials not fully configured')) {
                              useStorj = false;
                              setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Storj not configured. Falling back to database storage (Warning: may hit quota limits).`]);
                            } else {
                              throw storjErr;
                            }
                          }
                        }
                        
                        // If Storj is not used (fallback)
                        if (!useStorj) {
                          pagesToInsert.push({
                            chapterId: chapterId,
                            pageNumber: pageIndex,
                            content: base64
                          });
                        }
                        
                        pageIndex++;
                      }
                    } catch (imgErr: any) {
                      setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error processing image ${i + 1}: ${imgErr.message}`]);
                    }
                  }
                  
                  if (!useStorj && pagesToInsert.length > 0) {
                    // Batch insert pages
                    const BATCH_SIZE = 50;
                    for (let i = 0; i < pagesToInsert.length; i += BATCH_SIZE) {
                      const chunk = pagesToInsert.slice(i, i + BATCH_SIZE);
                      await supabase.from('pages').insert(chunk);
                    }
                  }
                  
                  // Update chapter with URLs if Storj was used
                  if (useStorj && uploadedUrls.length > 0) {
                    await supabase
                      .from('chapters')
                      .update({
                        content: uploadedUrls,
                        pageCount: uploadedUrls.length
                      })
                      .eq('id', chapterId);
                  } else {
                    // Update page count for database fallback
                    await supabase
                      .from('chapters')
                      .update({
                        pageCount: pageIndex
                      })
                      .eq('id', chapterId);
                  }

                  setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Imported ${chapter.title} (${pageIndex} pages).`]);
                  success = true;
                } else {
                  setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Warning: No images found for ${chapter.title}.`]);
                  success = true; // Don't retry if it successfully scraped but found no images
                }
              } catch (chError: any) {
                retryCount++;
                if (retryCount >= maxRetries) {
                  setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error importing ${chapter.title}: ${chError.message}`]);
                }
              }
            }
          }
          
          // Update series lastUpdated
          await supabase
            .from('series')
            .update({
              lastUpdated: new Date().toISOString()
            })
            .eq('id', seriesId);
        }
      }

      setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Task finished for: ${seriesData.title}`]);
    } catch (error: any) {
      console.error("Import failed:", error);
      setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] CRITICAL Error: ${error.message}`]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleSyncAll = async () => {
    if (isImporting) return;
    setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting global sync for all sources...`]);
    
    try {
      for (const source of sources) {
        if (source.status !== 'Active') continue;
        setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Syncing source: ${source.name}...`]);
        try {
          const response = await fetch(`/api/scrape/auto?url=${encodeURIComponent(source.url)}&cookies=${encodeURIComponent(source.cookies || '')}&userAgent=${encodeURIComponent(source.userAgent || '')}`);
          const data = await response.json();
          
          if (!response.ok) {
            throw new Error(data.details || data.error || `Server returned ${response.status}`);
          }
          
          if (data.type === 'list' && data.series) {
            for (const s of data.series) {
              setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Fetching details for: ${s.title}...`]);
              const res = await fetch(`/api/scrape/auto?url=${encodeURIComponent(s.url)}&cookies=${encodeURIComponent(source.cookies || '')}&userAgent=${encodeURIComponent(source.userAgent || '')}`);
              if (!res.ok) {
                const errData = await res.json();
                setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: Could not fetch details for ${s.title} (${errData.details || res.statusText})`]);
                continue;
              }
              const full = await res.json();
              await handleImportSeries(full);
              await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3s between series
            }
          } else if (data.type === 'series') {
            await handleImportSeries(data);
          }
          
          // Update source lastSync
          await supabase
            .from('import_sources')
            .update({
              lastSync: new Date().toLocaleString()
            })
            .eq('id', source.id);
        } catch (error: any) {
          setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error syncing ${source.name}: ${error.message}`]);
        }
      }
      setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Global sync complete.`]);
    } catch (error: any) {
      setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Global sync failed: ${error.message}`]);
    }
  };

  const handleSyncLibrary = async () => {
    if (isImporting) return;
    setIsImporting(true);
    setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Starting library sync. Checking existing series for updates...`]);
    
    try {
      const { data: seriesList, error: seriesFetchError } = await supabase
        .from('series')
        .select('*')
        .not('sourceUrl', 'is', null);
      
      if (seriesFetchError) throw seriesFetchError;
      
      setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Found ${seriesList?.length || 0} series with source URLs.`]);
      
      if (seriesList) {
        for (const s of seriesList) {
          setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Checking updates for: ${s.title}...`]);
          const source = sources.find(src => {
            try {
              return s.sourceUrl && src.url && s.sourceUrl.includes(new URL(src.url).hostname);
            } catch (e) {
              return false;
            }
          });
          
          try {
            const response = await fetch(`/api/scrape/auto?url=${encodeURIComponent(s.sourceUrl)}&cookies=${encodeURIComponent(source?.cookies || '')}&userAgent=${encodeURIComponent(source?.userAgent || '')}`);
            const fullData = await response.json();
            
            // Update source cookies if we got new ones
            if (fullData.cookies && source && fullData.cookies !== source.cookies) {
               await supabase
                 .from('import_sources')
                 .update({ cookies: fullData.cookies })
                 .eq('id', source.id);
               source.cookies = fullData.cookies;
            }
            
            if (fullData && fullData.chapters) {
              // Temporarily set isImporting to false so handleImportSeries can run, then back to true
              setIsImporting(false);
              await handleImportSeries(fullData);
              setIsImporting(true);
            }
          } catch (err: any) {
            setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error checking ${s.title}: ${err.message}`]);
          }
        }
      }
      setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Library sync complete.`]);
    } catch (error: any) {
      setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Library sync failed: ${error.message}`]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportAll = async () => {
    if (!scrapedData) return;
    
    // Find the source this series belongs to (if any) to get its cookies
    const source = sources.find(src => {
      try {
        return scrapedData.url && src.url && scrapedData.url.includes(new URL(src.url).hostname);
      } catch (e) {
        return false;
      }
    });

    if (scrapedData.type === 'list') {
      for (const s of scrapedData.series) {
        setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Deep scraping series details: ${s.title}...`]);
        try {
          const response = await fetch(`/api/scrape/auto?url=${encodeURIComponent(s.url)}&cookies=${encodeURIComponent(source?.cookies || '')}&userAgent=${encodeURIComponent(source?.userAgent || '')}`);
          const fullData = await response.json();
          await handleImportSeries(fullData);
        } catch (error) {
          setImportLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Error: Failed to fetch details for ${s.title}`]);
        }
      }
    } else if (scrapedData.type === 'series') {
      await handleImportSeries(scrapedData);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Auto Import System</h1>
          <p className="text-zinc-500 font-medium">Connect external sources to automatically import new chapters.</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
          <button 
            onClick={() => setImportLog([])}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 sm:px-6 py-3 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-colors text-sm"
          >
            Clear Logs
          </button>
          <button 
            onClick={handleSyncLibrary}
            disabled={isImporting}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 sm:px-6 py-3 bg-blue-500 text-white font-bold rounded-2xl hover:bg-blue-400 transition-colors disabled:opacity-50 text-sm"
          >
            <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" /> Sync Library
          </button>
          <button 
            onClick={handleSyncAll}
            disabled={isImporting}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 sm:px-6 py-3 bg-emerald-500 text-black font-bold rounded-2xl hover:bg-emerald-400 transition-colors disabled:opacity-50 text-sm"
          >
            <Zap className="w-4 h-4 sm:w-5 sm:h-5" /> Sync All
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex-1 sm:flex-none flex justify-center items-center gap-2 px-4 sm:px-6 py-3 bg-black text-white font-bold rounded-2xl hover:bg-zinc-800 transition-colors text-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" /> Add Source
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sources List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100">
              <h3 className="font-black uppercase tracking-tight">Configured Sources</h3>
            </div>
            <div className="divide-y divide-zinc-100">
              {sources.map((source) => (
                <div key={source.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-zinc-50 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-zinc-100 rounded-2xl text-zinc-500 shrink-0">
                      <Globe className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold truncate">{source.name}</p>
                      <p className="text-xs text-zinc-500 font-medium truncate">{source.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 w-full sm:w-auto">
                    <div className="text-left sm:text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${source.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-zinc-100 text-zinc-600'}`}>
                        {source.status}
                      </span>
                      <p className="text-[10px] font-bold text-zinc-400 mt-1 uppercase tracking-widest">Last sync: {source.lastSync}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                      <button 
                        onClick={() => handleTestConnection(source)}
                        disabled={isTesting === source.id || isImporting}
                        className={`p-2 rounded-lg transition-colors ${isTesting === source.id ? 'text-zinc-300' : 'text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50'}`}
                        title="Test Connection"
                      >
                        {isTesting === source.id ? (
                          <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Zap className="w-5 h-5" />
                        )}
                      </button>
                      <button 
                        onClick={() => handleEditSource(source)}
                        className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => handleRunImport(source.id)}
                        disabled={isImporting}
                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-30"
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSource(source.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Import Log */}
          <div className="bg-zinc-900 rounded-3xl p-6 shadow-xl border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-black uppercase tracking-tight text-sm">Import Console</h3>
              {isImporting && <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />}
            </div>
            <div className="space-y-2 font-mono text-xs h-48 overflow-y-auto custom-scrollbar mb-6">
              {importLog.map((log, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-zinc-600">[{new Date().toLocaleTimeString()}]</span>
                  <span className={log.includes('Successfully') || log.includes('Found') ? 'text-emerald-400' : log.includes('Error') ? 'text-red-400' : 'text-zinc-300'}>{log}</span>
                </div>
              ))}
              {importLog.length === 0 && <p className="text-zinc-600 italic">Waiting for import task...</p>}
            </div>

            {scrapedData && (
              <div className="space-y-4 border-t border-white/10 pt-6">
                <div className="flex items-center justify-between">
                  <h4 className="text-white text-[10px] font-black uppercase tracking-widest">
                    Discovered {scrapedData.type === 'list' ? 'Series' : scrapedData.type === 'series' ? 'Chapters' : 'Content'}
                  </h4>
                  {scrapedData.type === 'list' && (
                    <button 
                      onClick={handleImportAll}
                      disabled={isImporting}
                      className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-400 disabled:opacity-50"
                    >
                      Import All Discovered
                    </button>
                  )}
                  {scrapedData.type === 'series' && (
                    <button 
                      onClick={() => handleImportSeries(scrapedData)}
                      disabled={isImporting}
                      className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-400 disabled:opacity-50"
                    >
                      Import This Series
                    </button>
                  )}
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {scrapedData.type === 'list' && scrapedData.series?.map((s: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group">
                      <div className="flex items-center gap-3 flex-1 min-w-0 mr-4">
                        {s.coverImage && <img src={s.coverImage || undefined} className="w-8 h-10 object-cover rounded-md" alt="" referrerPolicy="no-referrer" />}
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-bold truncate">{s.title}</p>
                          <p className="text-zinc-500 text-[10px] truncate">{s.url}</p>
                        </div>
                      </div>
                      <button 
                        onClick={async () => {
                          setIsImporting(true);
                          try {
                            const res = await fetch(`/api/scrape/auto?url=${encodeURIComponent(s.url)}`);
                            const full = await res.json();
                            await handleImportSeries(full);
                          } catch (e) {
                            setImportLog(prev => [...prev, `Error fetching details for ${s.title}`]);
                          } finally {
                            setIsImporting(false);
                          }
                        }}
                        disabled={isImporting}
                        className="px-3 py-1.5 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      >
                        Import
                      </button>
                    </div>
                  ))}

                  {scrapedData.type === 'series' && scrapedData.chapters?.map((ch: any, i: number) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                      <div className="flex-1 min-w-0 mr-4">
                        <p className="text-white text-xs font-bold truncate">{ch.title}</p>
                        <p className="text-zinc-500 text-[10px] truncate">{ch.url}</p>
                      </div>
                      <span className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Pending</span>
                    </div>
                  ))}

                  {scrapedData.type === 'chapter' && scrapedData.images?.map((img: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                      <img src={img || undefined} className="w-12 h-12 object-cover rounded" alt="" />
                      <p className="text-zinc-500 text-[10px] truncate">{img}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Settings / Info */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
            <h3 className="font-black uppercase tracking-tight">Import Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Auto-Publish</span>
                <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Notify Users</span>
                <div className="w-10 h-5 bg-emerald-500 rounded-full relative">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Auto-Translate</span>
                <div className="w-10 h-5 bg-zinc-200 rounded-full relative">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 space-y-4">
            <div className="flex items-center gap-3 text-emerald-600">
              <Zap className="w-5 h-5" />
              <h3 className="font-black uppercase tracking-tight">Pro Tip</h3>
            </div>
            <p className="text-sm text-emerald-700 font-medium leading-relaxed">
              Use RSS feeds for the fastest updates. Most major manga sites provide RSS feeds for their latest releases.
            </p>
          </div>
        </div>
      </div>

      {/* Add Source Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black uppercase tracking-tight">{editingSource ? 'Edit Source' : 'Add Source'}</h2>
              <button onClick={() => { setIsModalOpen(false); setEditingSource(null); }} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddSource} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Source Name</label>
                <input 
                  type="text" 
                  required
                  value={newSource.name}
                  onChange={e => setNewSource({...newSource, name: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="e.g. Manga Website"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Website URL</label>
                <input 
                  type="url" 
                  required
                  value={newSource.url}
                  onChange={e => setNewSource({...newSource, url: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="https://example.com/latest"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Custom Cookies (Optional - for Cloudflare)</label>
                <textarea 
                  value={newSource.cookies}
                  onChange={e => setNewSource({...newSource, cookies: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 h-20 resize-none"
                  placeholder="cf_clearance=...; session=..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">User Agent (Optional)</label>
                <input 
                  type="text" 
                  value={newSource.userAgent}
                  onChange={e => setNewSource({...newSource, userAgent: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Mozilla/5.0..."
                />
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <p className="text-[10px] text-amber-700 font-bold leading-relaxed">
                  <span className="uppercase tracking-widest block mb-1">Cloudflare Bypass:</span>
                  If you get a 403 error, open the site in your browser, solve the challenge, then copy your cookies (F12 {'>'} Application {'>'} Cookies) and User Agent (F12 {'>'} Console {'>'} navigator.userAgent) here.
                </p>
              </div>
              <div className="flex gap-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); setEditingSource(null); }}
                  className="flex-1 py-3 text-zinc-500 font-bold hover:bg-zinc-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-black text-white font-bold rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  {editingSource ? 'Save Changes' : 'Add Source'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
