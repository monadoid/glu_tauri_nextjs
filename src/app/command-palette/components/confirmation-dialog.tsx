"use client"
import React from "react";
import LoadingSpinner from "./loading-spinner"
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";

interface ToolCall {
    id: string;
    tool_name: string;
    args: Record<string, unknown>;
    api_name?: string;
}

interface ConfirmationDialogProps {
    toolCall: ToolCall;
    onConfirm: () => void;
    onCancel: () => void;
    isConfirming?: boolean;
}

export default function ConfirmationDialog({
                                       toolCall,
                                       onConfirm,
                                       onCancel,
                                       isConfirming
                                   }: ConfirmationDialogProps) {
    // Add early return if toolCall is undefined
    if (!toolCall) {
        console.error('ConfirmationDialog: toolCall prop is required');
        return null;
    }

    const { tool_name, args, api_name } = toolCall;

    // Format the tool name for display
    const formattedToolName = tool_name
        .split("_")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    // Recursively format nested objects/arrays for display
    const formatValue = (value: unknown): string => {
        if (value === null || value === undefined) return "";
        if (Array.isArray(value)) {
            return value.map(formatValue).join(", ");
        }
        if (typeof value === "object" && value !== null) {
            return Object.entries(value)
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                .filter(([_, v]) => v !== null && v !== "" && v !== undefined)
                .map(([k, v]) => `${k}: ${formatValue(v)}`)
                .join(", ");
        }
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        return String(value);
    };

    // Flatten and format arguments for display
    const getDisplayParams = (args: Record<string, unknown>): Array<{ label: string; value: string }> => {
        const result: Array<{ label: string; value: string }> = [];

        const processObject = (obj: Record<string, unknown>, prefix = "") => {
            Object.entries(obj).forEach(([key, value]) => {
                // Skip null, undefined, or empty string values
                if (value === null || value === undefined || value === "") return;

                // Format the label
                const label = prefix
                    ? `${prefix} ${key}`.trim()
                    : key.replace(/_/g, " ");

                const formattedLabel = label
                    .split(" ")
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ");

                // If value is an object but not an array, recurse
                if (typeof value === "object" && value !== null && !Array.isArray(value)) {
                    processObject(value as Record<string, unknown>, label);
                } else {
                    result.push({
                        label: formattedLabel,
                        value: formatValue(value),
                    });
                }
            });
        };

        processObject(args);
        return result;
    };

    const displayParams = getDisplayParams(args);

    return (
        <Dialog open={true} onOpenChange={() => onCancel()}>
            <DialogContent>
                <DialogTitle>Confirm Action</DialogTitle>
                <div className="text-zinc-300 mb-4">
                    <div className="font-semibold">{formattedToolName}</div>
                    {api_name && (
                        <span className="text-zinc-400 text-sm ml-2">
              via <span className="font-semibold capitalize">{api_name}</span>
            </span>
                    )}
                </div>
                <div className="mt-2 bg-zinc-800 p-4 rounded">
                    {displayParams.map(({ label, value }) => (
                        <p key={label} className="text-zinc-100 mb-2">
                            <strong>{label}:</strong>{" "}
                            <span className="text-zinc-300">{value}</span>
                        </p>
                    ))}
                </div>
                <DialogFooter className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onConfirm}
                        disabled={isConfirming}
                    >
                        {isConfirming ? (
                            <LoadingSpinner className="mr-2 h-4 w-4" />
                        ) : null}
                        Confirm
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}