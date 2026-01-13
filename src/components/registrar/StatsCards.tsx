// app/components/registrar/StatsCards.tsx
"use client";

import {
    getPendingRegistrationCount,
    getPendingApplicationCount,
    getActiveStudents,
    getCriticalLogs,
    getLastWeekPendingRegistrationCount,
    getLastWeekPendingApplicationCount,
    getLastWeekActiveStudents,
    getLastWeekCriticalLogs,
} from "@/app/_actions/registrarHome";
import React, { useState, useEffect } from "react";
import { Users, FileText, Clock, AlertTriangle } from "lucide-react";

export default function StatsCards() {
    const [activeStudentCount, setActiveStudentCount] = useState<number | null>(null);
    const [pendingApplicationsCount, setPendingApplicationsCount] = useState<number | null>(null);
    const [pendingRegistrationsCount, setPendingRegistrationsCount] = useState<number | null>(null);
    const [criticalAlertsCount, setCriticalAlertsCount] = useState<number | null>(null);

    // Previous counts for comparison (last week)
    const [prevActiveStudentCount, setPrevActiveStudentCount] = useState<number | null>(null);
    const [prevPendingApplicationsCount, setPrevPendingApplicationsCount] = useState<number | null>(null);
    const [prevPendingRegistrationsCount, setPrevPendingRegistrationsCount] = useState<number | null>(null);
    const [prevCriticalAlertsCount, setPrevCriticalAlertsCount] = useState<number | null>(null);

    // Calculate change percentage and text
    const calculateChange = (current: number | null, previous: number | null) => {
        if (current === null || previous === null || previous === 0) {
            return { text: "No data from last week", color: "text-gray-500" };
        }
        
        const change = current - previous;
        const percentChange = ((change / previous) * 100).toFixed(1);
        const sign = change > 0 ? "+" : "";
        const color = change > 0 ? "text-green-600" : change < 0 ? "text-red-600" : "text-gray-500";
        
        return {
            text: `${sign}${percentChange}% from last week`,
            color
        };
    };

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

        const fetchCriticalLogs = async () => {
            try {
                const result = await getCriticalLogs();
                const count = result.success ? result.count : 0;
                setCriticalAlertsCount(count);
            } catch {
                setCriticalAlertsCount(0);
            }
        };

        // Fetch last week's data
        const fetchLastWeekActiveStudents = async () => {
            try {
                const result = await getLastWeekActiveStudents();
                const count = result.success ? result.count : 0;
                setPrevActiveStudentCount(count);
            } catch {
                setPrevActiveStudentCount(0);
            }
        };

        const fetchLastWeekPendingRegistrations = async () => {
            try {
                const result = await getLastWeekPendingRegistrationCount();
                const count = result.success ? result.count : 0;
                setPrevPendingRegistrationsCount(count);
            } catch {
                setPrevPendingRegistrationsCount(0);
            }
        };

        const fetchLastWeekPendingApplications = async () => {
            try {
                const result = await getLastWeekPendingApplicationCount();
                const count = result.success ? result.count : 0;
                setPrevPendingApplicationsCount(count);
            } catch {
                setPrevPendingApplicationsCount(0);
            }
        };

        const fetchLastWeekCriticalLogs = async () => {
            try {
                const result = await getLastWeekCriticalLogs();
                const count = result.success ? result.count : 0;
                setPrevCriticalAlertsCount(count);
            } catch {
                setPrevCriticalAlertsCount(0);
            }
        };

        // Fire all requests independently
        fetchActiveStudents();
        fetchPendingRegistrations();
        fetchPendingApplications();
        fetchCriticalLogs();
        
        // Fetch last week's data
        fetchLastWeekActiveStudents();
        fetchLastWeekPendingRegistrations();
        fetchLastWeekPendingApplications();
        fetchLastWeekCriticalLogs();
    }, []);

    // Calculate dynamic changes
    const activeStudentsChange = calculateChange(activeStudentCount, prevActiveStudentCount);
    const pendingApplicationsChange = calculateChange(pendingApplicationsCount, prevPendingApplicationsCount);
    const pendingRegistrationsChange = calculateChange(pendingRegistrationsCount, prevPendingRegistrationsCount);
    const criticalAlertsChange = calculateChange(criticalAlertsCount, prevCriticalAlertsCount);

    const mainStats = [
        {
            label: "Total Active Students",
            value: activeStudentCount === null ? "..." : activeStudentCount,
            change: activeStudentsChange.text,
            changeColor: activeStudentsChange.color,
            icon: <Users className="w-6 h-6" />,
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            label: "Pending Applications",
            value: pendingApplicationsCount === null ? "..." : pendingApplicationsCount,
            change: pendingApplicationsChange.text,
            changeColor: pendingApplicationsChange.color,
            icon: <FileText className="w-6 h-6" />,
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600"
        },
        {
            label: "Pending Registrations",
            value: pendingRegistrationsCount === null ? "..." : pendingRegistrationsCount,
            change: pendingRegistrationsChange.text,
            changeColor: pendingRegistrationsChange.color,
            icon: <Clock className="w-6 h-6" />,
            iconBg: "bg-orange-100",
            iconColor: "text-orange-600"
        },
        {
            label: "Critical Alerts",
            value: criticalAlertsCount === null ? "..." : criticalAlertsCount,
            change: criticalAlertsChange.text,
            changeColor: criticalAlertsChange.color,
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