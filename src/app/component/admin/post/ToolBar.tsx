"use client"

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createHeadingNode } from "@lexical/rich-text";
import { $setBlocksType } from "@lexical/selection";
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import UndoIcon from '@mui/icons-material/Undo';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import {
    $getSelection,
    $isRangeSelection,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    UNDO_COMMAND,
} from "lexical";
import React, { useCallback, useEffect, useState } from "react";
import { mergeRegister } from "@lexical/utils";
import { useDebouncedCallback } from "use-debounce";

export default function Toolbars() {
    const [editor] = useLexicalComposerContext();
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [isCenter, setIsCenter] = useState(false);
    const [isLeft, setIsLeft] = useState(false);
    const [isRight, setIsRight] = useState(false);
    const [isJustify, setIsJustify] = useState(false);

    const $updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            // Update text format
            setIsBold(selection.hasFormat("bold"));
            setIsItalic(selection.hasFormat("italic"));
            const anchorNode = selection.anchor.getNode();
            const element = anchorNode.getTopLevelElementOrThrow();
            const format = element.getFormatType();
            setIsCenter(format === "center");
            setIsLeft(format === "left");
            setIsRight(format === "right");
            setIsJustify(format === "justify");
        }
    }, []);

    const handleSave = useDebouncedCallback((content) => {
        console.log(content);
    }, 500);
    useEffect(() => {
        mergeRegister(
            editor.registerUpdateListener(
                ({ editorState, dirtyElements, dirtyLeaves }) => {
                    editorState.read(() => {
                        $updateToolbar();
                    });
                    if (dirtyElements.size === 0 && dirtyLeaves.size === 0) {
                        return;
                    }
                    handleSave(JSON.stringify(editorState));
                }
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                1
            )
        );
    }, [editor, $updateToolbar]);

    const handleHeading = () => {
        editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                // Update text format
                $setBlocksType(selection, () => $createHeadingNode("h1"));
            }
        });
    };
    return (
        <div className="space-x-3">
            <button type="button"
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
                }}
                className={` size-8 rounded-md ${isBold ? "bg-gray-200" : ""}`}
            >
                <FormatBoldIcon></FormatBoldIcon>
            </button>
            <button type="button"
                onClick={() => {
                    editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
                }}
                className={` size-8 rounded-md ${isItalic ? "bg-gray-200" : ""
                    }`}
            >
                <FormatItalicIcon></FormatItalicIcon>
            </button>
            <button type="button"
                onClick={() => {
                    if (!editor) return;
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")
                }}
                className={`size-8 rounded-md ${isCenter ? "bg-gray-200" : ""}`}>
                {FormatAlignCenterIcon && <FormatAlignCenterIcon />}
            </button>
            <button type="button"
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")
                }}
                className={`size-8 rounded-md ${isLeft ? "bg-gray-200" : ""}`}
            >
                {FormatAlignLeftIcon && <FormatAlignLeftIcon />}
            </button>
            <button type="button"
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")
                }}
                className={`size-8 rounded-md ${isJustify ? "bg-gray-200" : ""}`}
            >
                {FormatAlignJustifyIcon && <FormatAlignJustifyIcon />}
            </button>
            <button type="button"
                onClick={() => {
                    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")
                }}
                className={`size-8 rounded-md ${isRight ? "bg-gray-200" : ""}`}
            >
                {FormatAlignRightIcon && <FormatAlignRightIcon />}
            </button>
            <button type="button" onClick={handleHeading} className={` size-8 rounded-md `}>
                h1
            </button>
            <button type="button"
                disabled={!canUndo}
                onClick={() => {
                    editor.dispatchCommand(UNDO_COMMAND, undefined);
                }}
                className="toolbar-item spaced disabled:text-gray-500"
                aria-label="Undo"
            >
                <UndoIcon></UndoIcon>
            </button>
        </div>
    );
}