'use client';

import { type Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { BoldToolbar } from '../toolbars/bold';
import { ItalicToolbar } from '../toolbars/italic';
import { UnderlineToolbar } from '../toolbars/underline';
import { StrikeThroughToolbar } from '../toolbars/strikethrough';
import { LinkToolbar } from '../toolbars/link';
import { ToolbarProvider } from '../toolbars/toolbar-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useMediaQuery } from '@/hooks/use-media-querry';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { BlockquoteToolbar } from '../toolbars/blockquote';
import { useEffect } from 'react';

export function FloatingToolbar({ editor }: { editor: Editor | null }) {
  const isMobile = useMediaQuery('(max-width: 640px)');

  // Prevent default context menu on mobile
  useEffect(() => {
    if (!editor?.options.element || !isMobile) return;

    const handleContextMenu = (e: Event) => {
      e.preventDefault();
    };

    const el = editor.options.element;
    el.addEventListener('contextmenu', handleContextMenu);

    return () => el.removeEventListener('contextmenu', handleContextMenu);
  }, [editor, isMobile]);

  if (!editor) return null;

  if (isMobile) {
    return (
      <TooltipProvider>
        <BubbleMenu
          shouldShow={({ editor, from, to }) => {
            // Only show when there's a text selection (not just cursor placement)
            if (from === to) return false;

            // Don't show in code blocks
            if (editor.isActive('codeBlock')) return false;

            // Show when there's a selection and editor is editable
            return editor.isEditable && !editor.state.selection.empty;
          }}
          editor={editor}
          className='bg-white border border-gray-200 shadow-lg rounded-none overflow-hidden'
        >
          <ToolbarProvider editor={editor}>
            <ScrollArea className='w-full'>
              <div className='flex items-center px-1 py-1'>
                {/* Basic formatting - matching desktop toolbar */}
                <BoldToolbar />
                <ItalicToolbar />
                <UnderlineToolbar />
                <StrikeThroughToolbar />

                <div className='w-px h-6 bg-gray-200 mx-1' />

                <LinkToolbar />
                <BlockquoteToolbar />
              </div>
              <ScrollBar className='hidden' orientation='horizontal' />
            </ScrollArea>
          </ToolbarProvider>
        </BubbleMenu>
      </TooltipProvider>
    );
  }

  return null;
}
