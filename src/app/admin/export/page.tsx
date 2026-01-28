"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, FileText } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { exportMatrimonyProfiles, exportDirectoryEntries } from "@/services/adminService";

export default function ExportPage() {
  const { user } = useAuth();
  const [exporting, setExporting] = useState<string | null>(null);

  const downloadJSON = (data: any[], filename: string) => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    const csv = [
      headers.join(","),
      ...data.map((row) =>
        headers
          .map((header) => {
            const value = row[header];
            if (value === null || value === undefined) return "";
            if (typeof value === "string" && value.includes(",")) {
              return `"${value}"`;
            }
            return value;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMatrimony = async (format: "json" | "csv") => {
    setExporting("matrimony");
    try {
      const data = await exportMatrimonyProfiles();
      const filename = `matrimony_profiles_${new Date().toISOString().split("T")[0]}.${format}`;

      if (format === "json") {
        downloadJSON(data, filename);
      } else {
        downloadCSV(data, filename);
      }
    } catch (error) {
      alert("Failed to export matrimony profiles");
      console.error(error);
    } finally {
      setExporting(null);
    }
  };

  const handleExportDirectory = async (format: "json" | "csv") => {
    setExporting("directory");
    try {
      const data = await exportDirectoryEntries();
      const filename = `directory_${new Date().toISOString().split("T")[0]}.${format}`;

      if (format === "json") {
        downloadJSON(data, filename);
      } else {
        downloadCSV(data, filename);
      }
    } catch (error) {
      alert("Failed to export directory");
      console.error(error);
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-maroon-900">Data Export</h1>
        <p className="text-maroon-600 mt-1">
          Export community data for reports and backups
        </p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matrimony Profiles Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow border border-maroon-200 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">💑</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-maroon-900">Matrimony Profiles</h3>
              <p className="text-sm text-maroon-600">All registered profiles</p>
            </div>
          </div>

          <p className="text-maroon-700 text-sm mb-6">
            Download all matrimony profiles with their details, status, and timestamps.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => handleExportMatrimony("json")}
              disabled={exporting === "matrimony"}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              {exporting === "matrimony" ? "Exporting..." : "Download as JSON"}
            </button>
            <button
              onClick={() => handleExportMatrimony("csv")}
              disabled={exporting === "matrimony"}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={18} />
              {exporting === "matrimony" ? "Exporting..." : "Download as CSV"}
            </button>
          </div>
        </motion.div>

        {/* Directory Export */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow border border-maroon-200 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-maroon-900">Community Directory</h3>
              <p className="text-sm text-maroon-600">All member profiles</p>
            </div>
          </div>

          <p className="text-maroon-700 text-sm mb-6">
            Download the community directory with member contact information and details.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => handleExportDirectory("json")}
              disabled={exporting === "directory"}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={18} />
              {exporting === "directory" ? "Exporting..." : "Download as JSON"}
            </button>
            <button
              onClick={() => handleExportDirectory("csv")}
              disabled={exporting === "directory"}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText size={18} />
              {exporting === "directory" ? "Exporting..." : "Download as CSV"}
            </button>
          </div>
        </motion.div>
      </div>

      {/* Information Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg"
      >
        <h3 className="font-bold text-blue-900 mb-2">Export Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• JSON format includes all fields and nested data</li>
          <li>• CSV format is compatible with Excel and Google Sheets</li>
          <li>• Sensitive information like passwords is never exported</li>
          <li>• Only approved/active records are included in exports</li>
          <li>• Export files are generated on-demand (not stored on server)</li>
        </ul>
      </motion.div>
    </div>
  );
}
