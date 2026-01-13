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
import { Users, FileText, Clock, AlertTriangle } from "lucide-react";

export default function StatsCards() {
    const [activeStudentCount, setActiveStudentCount] = useState<number | null>(null);
    const [pendingApplicationsCount, setPendingApplicationsCount] = useState<number | null>(null);
    const [pendingRegistrationsCount, setPendingRegistrationsCount] = useState<number | null>(null);
    const [criticalAlertsCount, setCriticalAlertsCount] = useState<number>(3);
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
                setPendingRegistrationsCount(count);
            } catch {
                setPendingRegistrationsCount(0);
            }
        };

        const fetchPendingApplications = async () => {
            try {
                const result = await getPendingApplicationCount();
                const count = result.success ? result.count : 0;
                setPendingApplicationsCount(count);
            } catch {
                setPendingApplicationsCount(0);
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
            change: "+12% from last month",
            changeColor: "text-green-600",
            icon: <Users className="w-6 h-6" />,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            label: "Pending Applications",
            value: pendingApplicationsCount === null ? "..." : pendingApplicationsCount,
            change: "-5% from last month",
            changeColor: "text-red-600",
            icon: <FileText className="w-6 h-6" />,
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600"
        },
        {
            label: "Pending Registrations",
            value: pendingRegistrationsCount === null ? "..." : pendingRegistrationsCount,
            change: "-8% from last month",
            changeColor: "text-red-600",
            icon: <Clock className="w-6 h-6" />,
            iconBg: "bg-orange-100",
            iconColor: "text-orange-600"
        },
        {
            label: "Critical Alerts",
            value: criticalAlertsCount,
            change: "+2 from yesterday",
            changeColor: "text-red-600",
            icon: <AlertTriangle className="w-6 h-6" />,
            iconBg: "bg-red-100",
            iconColor: "text-red-600"
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mainStats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                            <p className={`text-xs ${stat.changeColor}`}>{stat.change}</p>
                        </div>
                        <div className={`p-3 ${stat.iconBg} rounded-full`}>
                            {React.cloneElement(stat.icon, { className: `w-6 h-6 ${stat.iconColor}` })}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}