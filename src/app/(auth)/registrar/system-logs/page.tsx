'use client';

import React, { useState, useEffect } from "react";
import { FileDown, Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { getSystemLogs } from "@/app/_actions/getSystemLogs";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface SystemLog {
  logNumber: string;
  timestamp: string;
  user: string;
  action: string;
  status: string;
  role: string;
  actionCategory?: string;
  targetType?: string;
  severityLevel?: string;
}

export default function SystemLogsPage() {
  const [search, setSearch] = useState("");
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // CSV Export Function
  const exportToCSV = () => {
    try {
      // Determine what data to export
      let dataToExport: SystemLog[] = [];
      let filename = "";

      if (selectedRows.length > 0) {
        // Export only selected rows
        dataToExport = logs.filter(log => selectedRows.includes(log.logNumber));
        filename = `system_logs_selected_${new Date().toISOString().split('T')[0]}.csv`;
      } else if (search && filteredLogs.length > 0) {
        // Export filtered results
        dataToExport = filteredLogs;
        filename = `system_logs_filtered_${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        // Export all logs
        dataToExport = logs;
        filename = `system_logs_all_${new Date().toISOString().split('T')[0]}.csv`;
      }

      if (dataToExport.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Create CSV headers
      const headers = ["Log Number", "Timestamp", "User", "Action", "Status", "User Role"];

      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...dataToExport.map(log => [
          `"${log.logNumber}"`,
          `"${log.timestamp}"`,
          `"${log.user.replace(/"/g, '""')}"`, // Escape quotes in user names
          `"${log.action.replace(/"/g, '""')}"`, // Escape quotes in actions
          `"${log.status}"`,
          `"${log.role}"`
        ].join(","))
      ].join("\n");

      // Create and download file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Success message based on what was exported
      if (selectedRows.length > 0) {
        toast.success(`Exported ${dataToExport.length} selected log(s) to CSV`);
      } else if (search) {
        toast.success(`Exported ${dataToExport.length} filtered log(s) to CSV`);
      } else {
        toast.success(`Exported all ${dataToExport.length} log(s) to CSV`);
      }

      setExportDropdownOpen(false);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV file");
    }
  };

  // PDF Export Function
  const exportToPDF = () => {
    try {
      // Determine what data to export
      let dataToExport: SystemLog[] = [];
      let filename = "";
      let title = "";

      if (selectedRows.length > 0) {
        // Export only selected rows
        dataToExport = logs.filter(log => selectedRows.includes(log.logNumber));
        filename = `system_logs_selected_${new Date().toISOString().split('T')[0]}.pdf`;
        title = `System Logs - Selected (${dataToExport.length} logs)`;
      } else if (search && filteredLogs.length > 0) {
        // Export filtered results
        dataToExport = filteredLogs;
        filename = `system_logs_filtered_${new Date().toISOString().split('T')[0]}.pdf`;
        title = `System Logs - Filtered Results (${dataToExport.length} logs)`;
      } else {
        // Export all logs
        dataToExport = logs;
        filename = `system_logs_all_${new Date().toISOString().split('T')[0]}.pdf`;
        title = `System Logs - All Records (${dataToExport.length} logs)`;
      }

      if (dataToExport.length === 0) {
        toast.error("No data to export");
        return;
      }

      // Create PDF document
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(16);
      doc.text(title, 14, 15);

      // Add generation date
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

      // Prepare table data
      const tableData = dataToExport.map(log => [
        log.logNumber,
        log.timestamp,
        log.user,
        log.action,
        log.status,
        log.role
      ]);

      // Add table
      autoTable(doc, {
        head: [['Log Number', 'Timestamp', 'User', 'Action', 'Status', 'Role']],
        body: tableData,
        startY: 28,
        theme: 'striped',
        headStyles: { fillColor: [139, 0, 0] }, // Red color matching your theme
        styles: { fontSize: 8, cellPadding: 2 },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 35 },
          2: { cellWidth: 30 },
          3: { cellWidth: 50 },
          4: { cellWidth: 20 },
          5: { cellWidth: 25 }
        }
      });

      // Save the PDF
      doc.save(filename);

      // Success message based on what was exported
      if (selectedRows.length > 0) {
        toast.success(`Exported ${dataToExport.length} selected log(s) to PDF`);
      } else if (search) {
        toast.success(`Exported ${dataToExport.length} filtered log(s) to PDF`);
      } else {
        toast.success(`Exported all ${dataToExport.length} log(s) to PDF`);
      }

      setExportDropdownOpen(false);
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF file");
    }
  };

  // Fetch system logs on component mount
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const result = await getSystemLogs();

        if (result.success && result.logs) {
          setLogs(result.logs);
          setError(null);
        } else {
          setError(result.error || "Failed to fetch system logs");
          toast.error("Failed to load system logs");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        toast.error("Failed to load system logs");
        console.error("Error fetching logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.export-dropdown')) {
        setExportDropdownOpen(false);
      }
    };

    if (exportDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [exportDropdownOpen]);

  const filteredLogs = logs.filter((log) =>
    Object.values(log).some((value) =>
      String(value).toLowerCase().includes(search.toLowerCase())
    )
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const allRowIds = paginatedLogs.map((log) => log.logNumber);
  const isAllSelected = allRowIds.length > 0 && allRowIds.every(id => selectedRows.includes(id));

  const handleHeaderCheckbox = () => {
    if (isAllSelected) {
      // Remove only the current page's IDs from selected rows
      setSelectedRows(prev => prev.filter(id => !allRowIds.includes(id)));
      const remainingCount = selectedRows.length - allRowIds.length;
      toast.error(remainingCount > 0 ? `${remainingCount} logs still selected` : `0 logs selected`);
    } else {
      // Add the current page's IDs to existing selected rows
      setSelectedRows(prev => [...new Set([...prev, ...allRowIds])]);
      toast.success(`${selectedRows.length + allRowIds.filter(id => !selectedRows.includes(id)).length} log(s) selected`);
    }
  };

  const handleRowCheckbox = (logNumber: string) => {
    setSelectedRows(prev =>
      prev.includes(logNumber)
        ? prev.filter(id => id !== logNumber)
        : [...prev, logNumber]
    );
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          Recent System Activities
        </h2>
      </div>

      {/* Search + Export PDF Controls */}
      <div className="mb-4">
        <div className="mb-4 relative flex items-center gap-2 md:hidden">
          <input
            type="text"
            placeholder="Search system logs..."
            className="text-gray-700  w-full md:w-1/3 pl-10 pr-4 py-2 border border-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Search className="absolute top-2.5 left-3 text-gray-700" size={18} />
          <div className="relative export-dropdown">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center justify-center bg-red-800 hover:bg-red-900 text-white px-3 py-2 rounded-md text-sm"
            >
              <FileDown size={18} />
              <span className="hidden md:inline ml-2">Export</span>
              <ChevronDown size={16} className="ml-1" />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={exportToPDF}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileDown size={16} className="mr-2" />
                    <div className="flex flex-col items-start">
                      <span>Export as PDF</span>
                      <span className="text-xs text-gray-500">
                        {selectedRows.length > 0
                          ? `${selectedRows.length} selected`
                          : search
                            ? `${filteredLogs.length} filtered`
                            : `${logs.length} total`} rows
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileDown size={16} className="mr-2" />
                    <div className="flex flex-col items-start">
                      <span>Export as CSV</span>
                      <span className="text-xs text-gray-500">
                        {selectedRows.length > 0
                          ? `${selectedRows.length} selected`
                          : search
                            ? `${filteredLogs.length} filtered`
                            : `${logs.length} total`} rows
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hidden md:flex justify-between items-center">
          <div className="relative w-1/3 bg-white">
            <Search className="absolute top-2.5 left-3 text-gray-700" size={18} />
            <input
              type="text"
              placeholder="Search system logs..."
              className="text-gray-700 w-full pl-10 pr-4 py-2 border border-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative export-dropdown">
            <button
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
              className="flex items-center justify-center bg-red-800 hover:bg-red-900 text-white px-4 py-2 rounded-md text-sm"
            >
              <FileDown size={18} />
              <span className="ml-2">Export</span>
              <ChevronDown size={16} className="ml-1" />
            </button>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                <div className="py-1">
                  <button
                    onClick={exportToPDF}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileDown size={16} className="mr-2" />
                    <div className="flex flex-col items-start">
                      <span>Export as PDF</span>
                      <span className="text-xs text-gray-500">
                        {selectedRows.length > 0
                          ? `${selectedRows.length} selected`
                          : search
                            ? `${filteredLogs.length} filtered`
                            : `${logs.length} total`} rows
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FileDown size={16} className="mr-2" />
                    <div className="flex flex-col items-start">
                      <span>Export as CSV</span>
                      <span className="text-xs text-gray-500">
                        {selectedRows.length > 0
                          ? `${selectedRows.length} selected`
                          : search
                            ? `${filteredLogs.length} filtered`
                            : `${logs.length} total`} rows
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white overflow-x-auto rounded-md border border-red-700 text-gray-700">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="text-gray-500">Loading system logs...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center p-8">
            <div className="text-red-500">Error: {error}</div>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex justify-center items-center p-8">
            <div className="text-gray-500">
              {search ? "No logs found matching your search." : "No system logs available."}
            </div>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 border-b">Log Number</th>
                <th className="px-4 py-3 border-b">Timestamp</th>
                <th className="px-4 py-3 border-b">User</th>
                <th className="px-4 py-3 border-b">Action</th>
                <th className="px-4 py-3 border-b">Status</th>
                <th className="px-4 py-3 border-b">User Role</th>
                <th className="px-4 py-3 border-b text-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-red-600"
                    checked={isAllSelected}
                    onChange={handleHeaderCheckbox}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
                <tr key={log.logNumber} className="hover:bg-red-50">
                  <td className="px-4 py-4 border-t">{log.logNumber}</td>
                  <td className="px-4 py-4 border-t">{log.timestamp}</td>
                  <td className="px-4 py-4 border-t">{log.user}</td>
                  <td className="px-4 py-4 border-t">{log.action}</td>
                  <td className="px-4 py-4 border-t">
                    <span
                      className={`px-3 py-1 rounded-full text-white text-xs font-medium ${log.status === "Success"
                        ? "bg-green-500"
                        : log.status === "Failed"
                          ? "bg-red-500"
                          : "bg-yellow-500"
                        }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 border-t">{log.role}</td>
                  <td className="px-4 py-2 border-t text-center">
                    <input
                      type="checkbox"
                      className="form-checkbox h-4 w-4 text-red-600"
                      checked={selectedRows.includes(log.logNumber)}
                      onChange={() => handleRowCheckbox(log.logNumber)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && !error && filteredLogs.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
          {/* Items per page selector */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>entries per page</span>
          </div>

          {/* Pagination info and controls */}
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredLogs.length)} of {filteredLogs.length} entries
            </span>

            <div className="flex items-center gap-2">
              {/* Previous button */}
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;

                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentPage === pageNum
                          ? 'bg-red-800 text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <span className="px-2 text-gray-500">...</span>
                    <button
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next button */}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
