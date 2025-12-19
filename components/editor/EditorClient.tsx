"use client";

import { useState, useEffect, useMemo, useTransition, useCallback } from "react";
import { useRouter, usePathname } from "@/navigation";
import { saveStepContent, createFunnelStep, applyFunnelTemplate } from "@/app/actions/builder-actions"; 
import { getBlockDefinitions, Block, BlockType } from "@/lib/editor-config";
import EditorHeader from "./layout/EditorHeader";
import LeftSidebar from "./layout/LeftSidebar";
import RightSidebar from "./layout/RightSidebar";
import TemplateModal from "./TemplateModal"; 
import { Dialog } from "./overlays/Dialogs"; 
import FunnelMap from "./FunnelMap";

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Plus, GripVertical } from "lucide-react";
import BlockRenderer from "@/components/builder/BlockRenderer";

// --- SORTABLE BLOCK WRAPPER ---
function SortableBlock({ block, isSelected, onClick, onAddAfter, availableEvents, locale, onUpdate }: any) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
  
  const style = { 
    transform: CSS.Transform.toString(transform), 
    transition, 
    opacity: transform ? 0.8 : 1, 
    zIndex: transform ? 999 : 'auto' 
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group mb-1">
      <div 
        className={`relative transition-all duration-200 rounded-lg ${isSelected ? 'ring-2 ring-purple-600 ring-offset-2 ring-offset-slate-100 dark:ring-offset-[#0B1121] z-10' : 'hover:ring-1 hover:ring-purple-300 border border-transparent hover:border-purple-200'}`}
        onClick={(e) => { e.stopPropagation(); onClick(); }}
      >
        {/* DRAG HANDLE */}
        <div className={`absolute left-1/2 -top-3 -translate-x-1/2 flex items-center bg-slate-900 text-white rounded-full shadow-xl cursor-grab z-50 scale-0 group-hover:scale-100 transition-transform px-2 py-1 gap-2 ${isSelected ? 'scale-100' : ''}`}>
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-white/20 rounded"><GripVertical size={12} /></div>
          <span className="text-[10px] font-bold uppercase tracking-wider">{block.type.replace('_', ' ')}</span>
        </div>
        
        {/* RENDERER */}
        <BlockRenderer 
          block={block} 
          isPreview={true} 
          availableEvents={availableEvents} 
          locale={locale} 
          onUpdate={onUpdate}
        />
      </div>
      
      {/* ADD BUTTON */}
      <div className="h-4 w-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity absolute -bottom-2 z-20 cursor-pointer group-hover:pointer-events-auto" onClick={(e) => { e.stopPropagation(); onAddAfter(); }}>
        <div className="bg-purple-600 text-white rounded-full p-1 shadow-sm hover:scale-125 transition-transform"><Plus size={12} /></div>
        <div className="absolute h-[1px] w-full bg-purple-600/30 -z-10"></div>
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function EditorClient({ 
  funnel, userSubdomain, availableEvents = [], locale = 'ja', keysConfigured = { stripe: false, univa: false, aqua: false }
}: { 
  funnel: any, 
  userSubdomain: string, 
  availableEvents?: { id: string, title: string, date: string | Date }[], 
  locale?: string,
  keysConfigured?: { stripe: boolean, univa: boolean, aqua: boolean }
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const BLOCK_DEFINITIONS = useMemo(() => getBlockDefinitions(locale), [locale]);

  // --- STATE ---
  const [steps, setSteps] = useState<any[]>(funnel.steps || []);
  const [activeStepId, setActiveStepId] = useState<string>(funnel.steps?.[0]?.id || "");
  const [blocks, setBlocks] = useState<Block[]>([]);
  
  // HISTORY STATE
  const [past, setPast] = useState<Block[][]>([]);
  const [future, setFuture] = useState<Block[][]>([]);

  const [pageSettings, setPageSettings] = useState<{ background: string, padding: string }>({ background: '#ffffff', padding: '20px' });
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [mainTab, setMainTab] = useState<'editor' | 'map'>('editor');
  
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // MODALS STATE
  const [showTemplates, setShowTemplates] = useState(false);
  const [addStepModalOpen, setAddStepModalOpen] = useState(false);
  const [unsavedModalOpen, setUnsavedModalOpen] = useState(false);
  const [templateWarningOpen, setTemplateWarningOpen] = useState(false); 
  
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(null); 
  const [newStepName, setNewStepName] = useState("");

  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [addingIndex, setAddingIndex] = useState<number | null>(null);

  const activeStep = steps.find(s => s.id === activeStepId);
  const selectedBlock = blocks.find(b => b.id === selectedBlockId);

  // --- HISTORY HELPERS ---
  
  const updateBlocks = (newBlocks: Block[]) => {
    setPast(prev => [...prev, blocks]);
    setFuture([]); // Clear redo history on new change
    setBlocks(newBlocks);
    setIsDirty(true);
  };

  const undo = useCallback(() => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    
    setFuture(prev => [blocks, ...prev]);
    setBlocks(previous);
    setPast(newPast);
  }, [blocks, past]);

  const redo = useCallback(() => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    
    setPast(prev => [...prev, blocks]);
    setBlocks(next);
    setFuture(newFuture);
  }, [blocks, future]);

  // --- ACTIONS ---

  const handleInlineUpdate = (id: string, newContent: any) => {
    const newBlocks = blocks.map(b => b.id === id ? { ...b, content: newContent } : b);
    updateBlocks(newBlocks);
  };

  const handleBack = () => {
    if (isDirty) {
      setPendingNavigation('/dashboard/funnels');
      setUnsavedModalOpen(true);
    } else {
      router.push('/dashboard/funnels');
    }
  };

  const confirmNavigation = () => {
    if (pendingNavigation) router.push(pendingNavigation);
    setUnsavedModalOpen(false);
  };

  const handleAddStepSubmit = async () => {
    if (!newStepName) return;
    setSaving(true);
    try {
      const res = await createFunnelStep(funnel.id, newStepName);
      if (res?.success && res.step) {
        setSteps([...steps, res.step]);
        setActiveStepId(res.step.id);
        setMainTab('editor');
        setBlocks([]);
        setPast([]);
        setFuture([]);
        setPageSettings({ background: '#ffffff', padding: '20px' });
        setAddStepModalOpen(false);
        setNewStepName("");
      }
    } catch (e) { alert("Failed"); }
    setSaving(false);
  };

  // --- TEMPLATE LOGIC ---
  const handleTemplateSelect = (templateId: string) => {
    setPendingTemplateId(templateId);
    setTemplateWarningOpen(true);
  };

  const confirmLoadTemplate = async () => {
    if (!pendingTemplateId) return;
    setSaving(true);
    try {
      const res = await applyFunnelTemplate(funnel.id, pendingTemplateId);
      if (res.success && res.steps) {
        setSteps(res.steps);
        setActiveStepId(res.steps[0].id);
        const firstStepContent = res.steps[0].content as any;
        setBlocks(Array.isArray(firstStepContent) ? firstStepContent : firstStepContent.blocks || firstStepContent);
        setPast([]);
        setFuture([]);
        setIsDirty(false);
        setShowTemplates(false);
        setTemplateWarningOpen(false);
      }
    } catch (e) { alert("Error loading template"); }
    setSaving(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = blocks.findIndex((i) => i.id === active.id);
      const newIndex = blocks.findIndex((i) => i.id === over?.id);
      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      updateBlocks(newBlocks);
    }
  };

  const addBlock = (type: BlockType) => {
    const def = BLOCK_DEFINITIONS.find(d => d.type === type);
    if (!def) return;
    const newBlock: Block = { id: crypto.randomUUID(), type, content: JSON.parse(JSON.stringify(def.defaultContent)), styles: { textAlign: 'center', padding: '20px' } };
    
    const newBlocks = [...blocks];
    if (addingIndex !== null) {
      newBlocks.splice(addingIndex + 1, 0, newBlock);
      setAddingIndex(null);
    } else {
      newBlocks.push(newBlock);
    }
    updateBlocks(newBlocks);
  };

  const updateSelectedBlock = (field: string, value: any, isStyle = false) => {
    if (!selectedBlockId) return;
    const newBlocks = blocks.map(b => {
      if (b.id !== selectedBlockId) return b;
      if (isStyle) return { ...b, styles: { ...b.styles, [field]: value } };
      return { ...b, content: { ...b.content, [field]: value } };
    });
    updateBlocks(newBlocks);
  };

  const deleteSelectedBlock = () => {
    const newBlocks = blocks.filter(b => b.id !== selectedBlockId);
    setSelectedBlockId(null);
    updateBlocks(newBlocks);
  };

  const handleSave = async () => {
    setSaving(true);
    const payload = { blocks, settings: pageSettings };
    const res = await saveStepContent(activeStepId, payload);
    if (res?.success) {
      setIsDirty(false);
      setSteps(steps.map(s => s.id === activeStepId ? { ...s, content: payload } : s));
    }
    setSaving(false);
  };

  // --- EFFECTS ---

  useEffect(() => {
    if (activeStep?.content) {
      if (Array.isArray(activeStep.content)) {
        setBlocks(activeStep.content);
        setPageSettings({ background: '#ffffff', padding: '0px' });
      } else {
        const data = activeStep.content as any;
        setBlocks(data.blocks || []);
        setPageSettings(data.settings || { background: '#ffffff', padding: '0px' });
      }
      setSelectedBlockId(null);
      setPast([]);
      setFuture([]);
      setIsDirty(false);
    }
  }, [activeStepId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.isContentEditable || target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedBlockId && !isInput) {
        if (confirm("Delete selected block?")) {
          deleteSelectedBlock();
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      if (((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') || ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedBlockId, undo, redo]); 

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => { if (isDirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  return (
    <div className="flex flex-col h-screen bg-slate-100 dark:bg-[#0F172A] text-slate-900 dark:text-white overflow-hidden font-sans">
      
      <EditorHeader 
        funnel={funnel} activeStep={activeStep} userSubdomain={userSubdomain}
        isDirty={isDirty} saving={saving} viewMode={viewMode} setViewMode={setViewMode}
        onSave={handleSave} onToggleTemplates={() => setShowTemplates(!showTemplates)}
        locale={locale || 'ja'} switchLocale={(l) => router.replace(pathname, { locale: l })}
        mainTab={mainTab} setMainTab={setMainTab} onBack={handleBack}
        onUndo={undo} onRedo={redo} canUndo={past.length > 0} canRedo={future.length > 0}
      />

      {mainTab === 'editor' ? (
        <div className="flex-1 flex overflow-hidden relative">
          <LeftSidebar 
            isOpen={leftSidebarOpen} setIsOpen={setLeftSidebarOpen}
            steps={steps} activeStepId={activeStepId} setActiveStepId={setActiveStepId}
            onAddStep={() => setAddStepModalOpen(true)} onAddBlock={addBlock}
            definitions={BLOCK_DEFINITIONS} locale={locale || 'ja'} isDirty={isDirty}
          />

          <main className="flex-1 bg-slate-100 dark:bg-[#0B1121] overflow-y-auto flex justify-center py-10 px-4 transition-colors relative" onClick={() => setSelectedBlockId(null)}>
            <div 
              className={`transition-all duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)] flex flex-col bg-white shadow-sm ${
                viewMode === 'mobile' ? 'w-[375px] rounded-[30px] border-[8px] border-slate-800 shadow-2xl my-4 min-h-[700px]' : 'w-full max-w-5xl rounded-none min-h-full shadow-lg'
              }`}
              style={{ backgroundColor: pageSettings.background, padding: pageSettings.padding }}
              onClick={(e) => e.stopPropagation()}
            >
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex flex-col min-h-full">
                    {blocks.map((block, idx) => (
                      <SortableBlock 
                        key={block.id} 
                        block={block} 
                        isSelected={selectedBlockId === block.id}
                        onClick={() => { setSelectedBlockId(block.id); setRightSidebarOpen(true); }}
                        onAddAfter={() => { setAddingIndex(idx); setLeftSidebarOpen(true); }}
                        availableEvents={availableEvents} 
                        locale={locale}
                        onUpdate={handleInlineUpdate}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </main>

          <RightSidebar 
            isOpen={rightSidebarOpen} setIsOpen={setRightSidebarOpen}
            selectedBlock={selectedBlock} updateSelectedBlock={updateSelectedBlock}
            deleteSelectedBlock={deleteSelectedBlock} pageSettings={pageSettings}
            setPageSettings={setPageSettings} setIsDirty={setIsDirty}
            availableEvents={availableEvents} locale={locale || 'ja'}
            
            // PASS KEYS STATUS HERE
            keysConfigured={keysConfigured}
          />
        </div>
      ) : (
        <div className="flex-1 h-full relative"><FunnelMap steps={steps} activeStepId={activeStepId} onSelectStep={(id) => { setActiveStepId(id); setMainTab('editor'); }} /></div>
      )}

      {/* --- MODALS --- */}
      <TemplateModal isOpen={showTemplates} onClose={() => setShowTemplates(false)} onSelect={handleTemplateSelect} locale={locale} />
      <Dialog isOpen={templateWarningOpen} onClose={() => setTemplateWarningOpen(false)} title={locale === 'ja' ? 'テンプレートを適用しますか？' : 'Apply Template?'} description={locale === 'ja' ? '現在のページ内容はすべて上書きされ、失われます。この操作は取り消せません。' : 'This will overwrite all current page content. This action cannot be undone.'} confirmText={locale === 'ja' ? '上書きして適用' : 'Overwrite & Apply'} type="danger" onConfirm={confirmLoadTemplate} loading={saving} />
      <Dialog isOpen={addStepModalOpen} onClose={() => setAddStepModalOpen(false)} title={locale === 'ja' ? '新しいページを追加' : 'Add New Page'} confirmText={locale === 'ja' ? '作成' : 'Create'} onConfirm={handleAddStepSubmit} loading={saving}>
        <input autoFocus className="w-full p-3 border rounded-lg bg-slate-50 dark:bg-black/20 outline-none focus:ring-2 focus:ring-purple-500" placeholder={locale === 'ja' ? 'ページ名 (例: アップセル)' : 'Page Name (e.g. Upsell)'} value={newStepName} onChange={(e) => setNewStepName(e.target.value)} />
      </Dialog>
      <Dialog isOpen={unsavedModalOpen} onClose={() => setUnsavedModalOpen(false)} title={locale === 'ja' ? '保存されていない変更' : 'Unsaved Changes'} description={locale === 'ja' ? 'このまま移動すると変更内容は失われます。' : 'You have unsaved changes. Are you sure you want to leave?'} confirmText={locale === 'ja' ? '破棄して移動' : 'Discard & Leave'} type="danger" onConfirm={confirmNavigation} />
    </div>
  );
}