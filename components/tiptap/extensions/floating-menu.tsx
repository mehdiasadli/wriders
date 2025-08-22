'use client';

import {
  Heading1,
  Heading2,
  Heading3,
  ChevronRight,
  Quote,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { FloatingMenu } from '@tiptap/react/menus';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Editor } from '@tiptap/core';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useDebounce } from '@/hooks/use-debounce';

interface CommandItemType {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords: string;
  command: (editor: Editor) => void;
  group: string;
}

type CommandGroupType = {
  group: string;
  items: Omit<CommandItemType, 'group'>[];
};

const groups: CommandGroupType[] = [
  {
    group: 'Text',
    items: [
      {
        title: 'Text',
        description: 'Just start writing with plain text',
        icon: ChevronRight,
        keywords: 'paragraph text normal',
        command: (editor) => editor.chain().focus().clearNodes().run(),
      },
      {
        title: 'Heading 1',
        description: 'Large section heading',
        icon: Heading1,
        keywords: 'h1 title header',
        command: (editor) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        title: 'Heading 2',
        description: 'Medium section heading',
        icon: Heading2,
        keywords: 'h2 subtitle',
        command: (editor) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        title: 'Heading 3',
        description: 'Small section heading',
        icon: Heading3,
        keywords: 'h3 subheader',
        command: (editor) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      },
      {
        title: 'Blockquote',
        description: 'Insert a quote block',
        icon: Quote,
        keywords: 'blockquote quote cite',
        command: (editor) => editor.chain().focus().toggleBlockquote().run(),
      },
    ],
  },
  {
    group: 'Elements',
    items: [
      {
        title: 'Horizontal Rule',
        description: 'Add a horizontal divider',
        icon: Minus,
        keywords: 'horizontal rule divider line break',
        command: (editor) => editor.chain().focus().setHorizontalRule().run(),
      },
    ],
  },
  {
    group: 'Alignment',
    items: [
      {
        title: 'Align Left',
        description: 'Align text to the left',
        icon: AlignLeft,
        keywords: 'align left',
        command: (editor) => editor.chain().focus().setTextAlign('left').run(),
      },
      {
        title: 'Align Center',
        description: 'Center align text',
        icon: AlignCenter,
        keywords: 'align center',
        command: (editor) => editor.chain().focus().setTextAlign('center').run(),
      },
      {
        title: 'Align Right',
        description: 'Align text to the right',
        icon: AlignRight,
        keywords: 'align right',
        command: (editor) => editor.chain().focus().setTextAlign('right').run(),
      },
    ],
  },
];

export function TipTapFloatingMenu({ editor }: { editor: Editor }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const commandRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const filteredGroups = useMemo(
    () =>
      groups
        .map((group) => ({
          ...group,
          items: group.items.filter(
            (item) =>
              item.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              item.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
              item.keywords.toLowerCase().includes(debouncedSearch.toLowerCase())
          ),
        }))
        .filter((group) => group.items.length > 0),
    [debouncedSearch]
  );

  const flatFilteredItems = useMemo(() => filteredGroups.flatMap((g) => g.items), [filteredGroups]);

  const executeCommand = useCallback(
    (commandFn: (editor: Editor) => void) => {
      if (!editor) return;

      try {
        const { from } = editor.state.selection;
        const slashCommandLength = search.length + 1;

        editor
          .chain()
          .focus()
          .deleteRange({
            from: Math.max(0, from - slashCommandLength),
            to: from,
          })
          .run();

        commandFn(editor);
      } catch (error) {
        console.error('Error executing command:', error);
      } finally {
        setIsOpen(false);
        setSearch('');
        setSelectedIndex(-1);
      }
    },
    [editor, search]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen || !editor) return;

      const preventDefault = () => {
        e.preventDefault();
        e.stopImmediatePropagation();
      };

      switch (e.key) {
        case 'ArrowDown':
          preventDefault();
          setSelectedIndex((prev) => {
            if (prev === -1) return 0;
            return prev < flatFilteredItems.length - 1 ? prev + 1 : 0;
          });
          break;

        case 'ArrowUp':
          preventDefault();
          setSelectedIndex((prev) => {
            if (prev === -1) return flatFilteredItems.length - 1;
            return prev > 0 ? prev - 1 : flatFilteredItems.length - 1;
          });
          break;

        case 'Enter':
          preventDefault();
          const targetIndex = selectedIndex === -1 ? 0 : selectedIndex;
          if (flatFilteredItems[targetIndex]) {
            executeCommand(flatFilteredItems[targetIndex].command);
          }
          break;

        case 'Escape':
          preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
          break;
      }
    },
    [isOpen, selectedIndex, flatFilteredItems, executeCommand, editor]
  );

  useEffect(() => {
    if (!editor?.options.element) return;

    const editorElement = editor.options.element;
    const handleEditorKeyDown = (e: Event) => handleKeyDown(e as KeyboardEvent);

    editorElement.addEventListener('keydown', handleEditorKeyDown);
    return () => editorElement.removeEventListener('keydown', handleEditorKeyDown);
  }, [handleKeyDown, editor]);

  // Add new effect for resetting selectedIndex
  useEffect(() => {
    setSelectedIndex(-1);
  }, [search]);

  useEffect(() => {
    if (selectedIndex >= 0 && itemRefs.current[selectedIndex]) {
      itemRefs.current[selectedIndex]?.focus();
    }
  }, [selectedIndex]);

  return (
    <FloatingMenu
      editor={editor}
      shouldShow={({ state }) => {
        if (!editor) return false;

        const { $from } = state.selection;
        const currentLineText = $from.parent.textBetween(0, $from.parentOffset, '\n', ' ');

        const isSlashCommand =
          currentLineText.startsWith('/') &&
          $from.parent.type.name !== 'codeBlock' &&
          $from.parentOffset === currentLineText.length;

        if (!isSlashCommand) {
          if (isOpen) setIsOpen(false);
          return false;
        }

        const query = currentLineText.slice(1).trim();
        if (query !== search) setSearch(query);
        if (!isOpen) setIsOpen(true);
        return true;
      }}
      // tippyOptions={{
      //   placement: 'bottom-start',
      //   interactive: true,
      //   appendTo: () => document.body,
      //   onHide: () => {
      //     setIsOpen(false);
      //     setSelectedIndex(-1);
      //   },
      // }}
    >
      <Command
        role='listbox'
        ref={commandRef}
        className='z-50 w-72 overflow-hidden border border-gray-200 bg-white shadow-lg'
      >
        <ScrollArea className='max-h-[330px]'>
          <CommandList>
            <CommandEmpty className='py-3 text-center text-sm text-gray-500'>No results found</CommandEmpty>

            {filteredGroups.map((group, groupIndex) => (
              <CommandGroup
                key={`${group.group}-${groupIndex}`}
                heading={
                  <div className='px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100'>
                    {group.group}
                  </div>
                }
              >
                {group.items.map((item, itemIndex) => {
                  const flatIndex =
                    filteredGroups.slice(0, groupIndex).reduce((acc, g) => acc + g.items.length, 0) + itemIndex;

                  return (
                    <CommandItem
                      role='option'
                      key={`${group.group}-${item.title}-${itemIndex}`}
                      value={`${group.group}-${item.title}`}
                      onSelect={() => executeCommand(item.command)}
                      className={cn(
                        'gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer',
                        flatIndex === selectedIndex ? 'bg-gray-50' : ''
                      )}
                      aria-selected={flatIndex === selectedIndex}
                      ref={(el) => {
                        itemRefs.current[flatIndex] = el;
                      }}
                      tabIndex={flatIndex === selectedIndex ? 0 : -1}
                    >
                      <div className='flex h-8 w-8 items-center justify-center border border-gray-300 bg-white'>
                        <item.icon className='h-4 w-4 text-gray-700' />
                      </div>
                      <div className='flex flex-1 flex-col'>
                        <span className='text-sm font-medium text-gray-900'>{item.title}</span>
                        <span className='text-xs text-gray-500'>{item.description}</span>
                      </div>
                      <kbd className='ml-auto flex h-5 items-center border border-gray-300 bg-white px-1.5 text-xs text-gray-500'>
                        ↵
                      </kbd>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </ScrollArea>
      </Command>
    </FloatingMenu>
  );
}
