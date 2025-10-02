import { LayoutDashboard, Users, Calendar, FileText, Package, Stethoscope } from "lucide-react";
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
    name: string;
    key: string;
    icon: LucideIcon;
    pathSegment: string;
}

export const ALL_NAV_ITEMS: NavItem[] = [
    { name: "Dashboard", key: "dashboard", icon: LayoutDashboard, pathSegment: "dashboard" },
    { name: "Appointments", key: "appointments", icon: Calendar, pathSegment: "appointments" },
    { name: "Patients", key: "patients", icon: Users, pathSegment: "patients" },
    { name: "Appointment Reports", key: "appointment_reports", icon: FileText, pathSegment: "appointments/reports" },
    { name: "Dispenser", key: "dispenser", icon: Stethoscope, pathSegment: "dispenser" },
    { name: "Inventory", key: "inventory", icon: Package, pathSegment: "inventory" },
];