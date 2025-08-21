'use client';
import './tiptap.css';
import { cn } from '@/lib/utils';
import { ImageExtension } from '@/components/tiptap/extensions/image';
import { ImagePlaceholder } from '@/components/tiptap/extensions/image-placeholder';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Link from '@tiptap/extension-link';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, FontFamily } from '@tiptap/extension-text-style';
import Typography from '@tiptap/extension-typography';
import Underline from '@tiptap/extension-underline';
import { EditorContent, EditorEvents, type Extension, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TipTapFloatingMenu } from '@/components/tiptap/extensions/floating-menu';
import { FloatingToolbar } from '@/components/tiptap/extensions/floating-toolbar';
import { EditorToolbar } from './toolbars/editor-toolbar';
import Placeholder from '@tiptap/extension-placeholder';

const extensions = [
  StarterKit.configure({
    orderedList: {
      HTMLAttributes: {
        class: 'list-decimal',
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: 'list-disc',
      },
    },
    heading: {
      levels: [1, 2, 3, 4],
    },
  }),
  Placeholder.configure({
    emptyNodeClass: 'is-editor-empty',
    placeholder: ({ node }) => {
      switch (node.type.name) {
        case 'heading':
          return `Heading ${node.attrs.level}`;
        case 'detailsSummary':
          return 'Section title';
        case 'codeBlock':
          // never show the placeholder when editing code
          return '';
        default:
          return "Write, type '/' for commands";
      }
    },
    includeChildren: false,
  }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
    defaultAlignment: 'justify',
  }),
  TextStyle,
  Subscript,
  Superscript,
  Underline,
  Link,
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  ImageExtension,
  ImagePlaceholder,
  Typography,
];

export function RichTextEditor({
  className,
  content = '<p>Start writing your story...</p>',
  onUpdate,
}: {
  className?: string;
  content?: string;
  onUpdate: (props: EditorEvents['update']) => void;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: extensions as Extension[],
    content,
    editorProps: {
      attributes: {
        class: 'max-w-full focus:outline-none',
        style: 'font-family: "Times New Roman", serif; font-size: 16px;',
      },
    },
    onUpdate,
  });

  if (!editor) return null;

  return (
    <div
      className={cn(
        'relative max-h-[calc(100dvh-6rem)]  w-full overflow-hidden overflow-y-scroll border bg-card pb-[60px] sm:pb-0',
        className
      )}
    >
      <EditorToolbar editor={editor} />
      <FloatingToolbar editor={editor} />
      <TipTapFloatingMenu editor={editor} />
      <EditorContent editor={editor} className=' min-h-[600px] w-full min-w-full cursor-text sm:p-6' />
    </div>
  );
}
