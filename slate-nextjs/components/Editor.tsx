'use client';

import React, { useState, useCallback } from 'react';
import { BaseEditor, createEditor, Descendant, Editor, Transforms } from 'slate';
import { Slate, Editable, withReact, ReactEditor } from 'slate-react';
import { HistoryEditor, withHistory } from 'slate-history';

type Format = 'bold' | 'italic' | 'underline';
type BlockType = 'paragraph' | 'heading-one' | 'heading-two' | 'bulleted-list';
type CustomElement = {
  type: BlockType;
  children: CustomText[];
};
type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
};

declare module 'slate' {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const INITIAL_VALUE: Descendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'Select some text and click to see the custom menu.' }],
  },
];

export default function SlateEditor() {
  const [editor] = useState(() => withHistory(withReact(createEditor())));
  const [value, setValue] = useState<Descendant[]>(INITIAL_VALUE);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const toggleMark = (editor: Editor, format: Format) => {
    const isActive = isMarkActive(editor, format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  const isMarkActive = (editor: Editor, format: Format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  const handleMouseUp = (event: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      const { clientX, clientY } = event;
      setMenuVisible(true);
      setMenuPosition({ x: clientX, y: clientY });
    } else {
      setMenuVisible(false);
    }
  };

  const handleClickOutside = () => {
    setMenuVisible(false);
  };

  const regenerateContent = () => {
    setValue([
      {
        type: 'paragraph',
        children: [{ text: 'This is regenerated content!' }],
      },
    ]);
    setMenuVisible(false);
  };

  const moreVisual = () => {
    setValue([
      {
        type: 'paragraph',
        children: [{ text: 'You’ve chosen a more visual style!' }],
      },
    ]);
    setMenuVisible(false);
  };

  const moreDiscussion = () => {
    setValue([
      {
        type: 'paragraph',
        children: [{ text: 'Here is a discussion-oriented rewrite!' }],
      },
    ]);
    setMenuVisible(false);
  };

  const onPaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    const pastedText = event.clipboardData.getData('text');
    const lines = pastedText.split('\n').map((line) => ({
      type: 'paragraph' as BlockType,
      children: [{ text: line }],
    }));

    Transforms.insertNodes(editor, lines);
  };

  const renderElement = useCallback((props: any) => {
    switch (props.element.type) {
      case 'heading-one':
        return <h1 {...props.attributes} className="text-2xl font-bold">{props.children}</h1>;
      case 'heading-two':
        return <h2 {...props.attributes} className="text-xl font-bold">{props.children}</h2>;
      case 'bulleted-list':
        return <ul {...props.attributes} className="list-disc ml-4">{props.children}</ul>;
      default:
        return <DefaultElement {...props} />;
    }
  }, []);

  const renderLeaf = useCallback((props: any) => {
    return <Leaf {...props} />;
  }, []);

  return (
    <div
      className="w-full max-w-4xl mx-auto p-4 relative"
      onMouseDown={handleClickOutside}
    >
      <Slate editor={editor} initialValue={value} onChange={(newValue) => setValue(newValue)}>
        <Editable
          className="min-h-[300px] p-4 border rounded-md focus:outline-none"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Start typing here..."
          onMouseUp={handleMouseUp} // Handle click after selection
          onPaste={onPaste} // Add the custom paste handler
          spellCheck
        />
      </Slate>
      {menuVisible && (
        <div
          className="absolute bg-white border shadow-lg rounded-md p-4 z-10"
          style={{
            top: menuPosition.y + 10,
            left: menuPosition.x + 10,
            minWidth: '200px',
          }}
        >
          <h3 className="font-semibold text-gray-700 mb-2">Actions</h3>
          <button
            className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-gray-800"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMark(editor, 'bold');
              setMenuVisible(false);
            }}
          >
            Bold
          </button>
          <button
            className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-gray-800"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMark(editor, 'italic');
              setMenuVisible(false);
            }}
          >
            Italic
          </button>
          <button
            className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 text-gray-800"
            onMouseDown={(e) => {
              e.preventDefault();
              toggleMark(editor, 'underline');
              setMenuVisible(false);
            }}
          >
            Underline
          </button>
          <div className="border-t my-2"></div>
          <button
            className="block w-full text-left px-3 py-2 rounded-md hover:bg-blue-50 text-blue-700"
            onMouseDown={regenerateContent}
          >
            Regenerate
          </button>
          <button
            className="block w-full text-left px-3 py-2 rounded-md hover:bg-green-50 text-green-700"
            onMouseDown={moreVisual}
          >
            More Visual
          </button>
          <button
            className="block w-full text-left px-3 py-2 rounded-md hover:bg-green-50 text-green-700"
            onMouseDown={moreVisual}
          >
            more examplebased
          </button>
          <button
            className="block w-full text-left px-3 py-2 rounded-md hover:bg-yellow-50 text-yellow-700"
            onMouseDown={moreDiscussion}
          >
            More Discussion
          </button>
        </div>
      )}
    </div>
  );
}

const Leaf = ({ attributes, children, leaf }: { attributes: any; children: React.ReactNode; leaf: CustomText }) => {
  if (leaf.bold) children = <strong>{children}</strong>;
  if (leaf.italic) children = <em>{children}</em>;
  if (leaf.underline) children = <u>{children}</u>;
  if(leaf.text === 'example') children = <span style={{color: 'red'}}>{children}</span>
  if(leaf.text === 'based') children = <span style={{color: 'blue'}}>{children}</span>
  
  return <span {...attributes}>{children}</span>;

};

const DefaultElement = ({ attributes, children }: { attributes: any; children: React.ReactNode }) => {
  return <p {...attributes}>{children}</p>;
};
