// app/components/registrar/StatsCards.tsx
"use client";

import {
    getActiveSubjects,
    getPendingRegistrationCount,
    getPendingApplicationCount,
    getActiveStudents,
    getActiveTermCount,
    getFeedbackCount,
    getApprovedRegistrationCount,
    getApprovedApplicationCount
} from "@/app/_actions/registrarHome";
import React, { useState, useEffect } from "react";
import { Users, TrendingUp, GraduationCap } from "lucide-react";

export default function StatsCards() {
    const [activeStudentCount, setActiveStudentCount] = useState<number | null>(null);
    const [approvedRegistrationCount, setApprovedRegistrationCount] = useState<number | null>(null);
    const [approvedApplicationCount, setApprovedApplicationCount] = useState<number | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [timeAgo, setTimeAgo] = useState<string>("Loading...");

    // Update time ago string
    useEffect(() => {
        if (!lastUpdated) return;

        const updateTimeAgo = () => {
            const now = new Date();
            const seconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

            if (seconds < 10) {
                setTimeAgo("Just now");
            } else if (seconds < 60) {
                setTimeAgo(`${seconds}s ago`);
            } else if (seconds < 3600) {
                const minutes = Math.floor(seconds / 60);
                setTimeAgo(`${minutes}m ago`);
            } else if (seconds < 86400) {
                const hours = Math.floor(seconds / 3600);
                setTimeAgo(`${hours}h ago`);
            } else {
                const days = Math.floor(seconds / 86400);
                setTimeAgo(`${days}d ago`);
            }
        };

        updateTimeAgo();
        const interval = setInterval(updateTimeAgo, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, [lastUpdated]);

    useEffect(() => {
        const fetchActiveStudents = async () => {
            try {
                const result = await getActiveStudents();
                const count = result.success ? result.count : 0;
                setActiveStudentCount(count);
            } catch {
                setActiveStudentCount(0);
            }
        };

        const fetchPendingRegistrations = async () => {
            try {
                const result = await getPendingRegistrationCount();
                const count = result.success ? result.count : 0;
                // Update the DOM element for the summary card
                const elem = document.getElementById('pending-registrations');
                if (elem) elem.textContent = count.toString();
            } catch {
                const elem = document.getElementById('pending-registrations');
                if (elem) elem.textContent = '0';
            }
        };

        const fetchPendingApplications = async () => {
            try {
                const result = await getPendingApplicationCount();
                const count = result.success ? result.count : 0;
                // Update the DOM element for the summary card
                const elem = document.getElementById('pending-applications');
                if (elem) elem.textContent = count.toString();
            } catch {
                const elem = document.getElementById('pending-applications');
                if (elem) elem.textContent = '0';
            }
        };

        const fetchActiveSubjects = async () => {
            try {
                const result = await getActiveSubjects();
                const count = result.success ? result.count : 0;
                // Update the DOM element for the summary card
                const elem = document.getElementById('active-courses');
                if (elem) elem.textContent = count.toString();
            } catch {
                const elem = document.getElementById('active-courses');
                if (elem) elem.textContent = '0';
            }
        };

        const fetchActiveTerms = async () => {
            try {
                const result = await getActiveTermCount();
                const count = result.success ? result.count : 0;
                // Update the DOM element for the summary card
                const elem = document.getElementById('active-terms');
                if (elem) elem.textContent = count.toString();
            } catch {
                const elem = document.getElementById('active-terms');
                if (elem) elem.textContent = '0';
            }
        };

        const fetchFeedback = async () => {
            try {
                const result = await getFeedbackCount();
                const count = result.success ? result.count : 0;
                // Update the DOM element for the summary card
                const elem = document.getElementById('feedback-count');
                if (elem) elem.textContent = count.toString();
            } catch {
                const elem = document.getElementById('feedback-count');
                if (elem) elem.textContent = '0';
            }
        };

        const fetchApprovedRegistrations = async () => {
            try {
                const result = await getApprovedRegistrationCount();
                const count = result.success ? result.count : 0;
                setApprovedRegistrationCount(count);
                // Update the DOM element for the summary card
                const elem = document.getElementById('approved-registrations');
                if (elem) elem.textContent = count.toString();
            } catch {
                setApprovedRegistrationCount(0);
            }
        };

        const fetchApprovedApplications = async () => {
            try {
                const result = await getApprovedApplicationCount();
                const count = result.success ? result.count : 0;
                setApprovedApplicationCount(count);
                // Update the DOM element for the summary card
                const elem = document.getElementById('approved-applications');
                if (elem) elem.textContent = count.toString();
            } catch {
                setApprovedApplicationCount(0);
            }
        };

        // Fire all requests independently
        fetchActiveStudents();
        fetchPendingRegistrations();
        fetchPendingApplications();
        fetchActiveSubjects();
        fetchActiveTerms();
        fetchFeedback();
        fetchApprovedRegistrations();
        fetchApprovedApplications();

        // Set last updated time
        setLastUpdated(new Date());
    }, []);

    const mainStats = [
        {
            label: "Total Active Students",
            value: activeStudentCount === null ? "..." : activeStudentCount,
            icon: <Users className="w-6 h-6" />,
            bgColor: "from-blue-500 to-blue-600",
            textColor: "text-blue-600",
            lightBg: "bg-blue-50"
        },
        {
            label: "Applications Processed",
            value: approvedApplicationCount === null ? "..." : approvedApplicationCount,
            icon: <GraduationCap className="w-6 h-6" />,
            bgColor: "from-emerald-500 to-emerald-600",
            textColor: "text-emerald-600",
            lightBg: "bg-emerald-50"
        },
        {
            label: "Registrations Completed",
            value: approvedRegistrationCount === null ? "..." : approvedRegistrationCount,
            icon: <TrendingUp className="w-6 h-6" />,
            bgColor: "from-violet-500 to-violet-600",
            textColor: "text-violet-600",
            lightBg: "bg-violet-50"
        }
    ];

    return (
        <div className="grid md:grid-cols-3 gap-6">
            {mainStats.map((stat, idx) => (
                <div
                    key={idx}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                >
                    {/* Card Header with gradient */}
                    <div className={`bg-gradient-to-r ${stat.bgColor} p-4`}>
                        <div className="flex items-center justify-between text-white">
                            <div className={`p-2 ${stat.lightBg} rounded-lg bg-white/20 backdrop-blur-sm`}>
                                {stat.icon}
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold">
                                    {stat.value}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-4 flex justify-between items-center">
                        <h3 className="text-sm font-semibold text-gray-700">
                            {stat.label}
                        </h3>
                        <span className="text-gray-500 text-xs" suppressHydrationWarning>Updated {timeAgo}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="h-1 bg-gray-100">
                        <div className={`h-full bg-gradient-to-r ${stat.bgColor} transition-all duration-1000 ease-out`}
                            style={{ width: stat.value === "..." ? "0%" : "100%" }}
                        ></div>
                    </div>
                </div>
            ))}
        </div>
    );
}