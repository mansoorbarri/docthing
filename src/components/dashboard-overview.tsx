"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import {
  Users,
  Calendar,
  Activity,
  UserPlus,
  CalendarPlus,
  FileText,
  TrendingUp,
  Clock,
  User, // For the new patient card
} from "lucide-react"
import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react"
import { Loading } from "~/components/loading";

// Define interfaces for API data structure
interface Patient {
  id: string
  firstName: string
  lastName: string
  createdAt: string // Assuming your database returns a creation timestamp
}

interface Appointment {
  id: string
  startTime: string
  status: string
  type?: string
  patient: {
    firstName: string
    lastName: string
  }
}

interface Stat {
  title: string
  value: number | string
  change: string
  changeType: "positive" | "negative"
  icon: typeof Users
}

// Helper functions (kept the same)
const isToday = (dateString: string) => {
  const date = new Date(dateString)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

// Helper to format time passed (for the new patients list)
const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'just now'
}

export function DashboardOverview() {
  const { user } = useUser()
  const [stats, setStats] = useState<Stat[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [newPatients, setNewPatients] = useState<Patient[]>([]) // New state for recent patients
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // --- 1. Fetch Patients ---
        const patientsRes = await fetch("/api/patients")
        const patientsData: Patient[] = await patientsRes.json()
        const totalPatients = patientsData.length

        // Sort patients by creation date (descending) and take the top 4
        const recentPatients = patientsData
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4)
        
        setNewPatients(recentPatients) // Update new state

        // --- 2. Fetch Appointments ---
        const appointmentsRes = await fetch("/api/appointments")
        const appointmentsData: Appointment[] = await appointmentsRes.json()
        
        // Filter for today's appointments
        const todayAppointments = appointmentsData.filter((app) => isToday(app.startTime))
        
        setAppointments(todayAppointments.slice(0, 4))

        // --- 3. Update Stats ---
        const newStats: Stat[] = [
          {
            title: "Total Patients",
            value: totalPatients.toLocaleString(),
            change: "N/A",
            changeType: "positive",
            icon: Users,
          },
          {
            title: "Today's Appointments",
            value: todayAppointments.length.toString(),
            change: "N/A",
            changeType: "positive",
            icon: Calendar,
          },
          {
            title: "Open Reports",
            value: "15",
            change: "-5%",
            changeType: "negative",
            icon: FileText,
          },
          {
            title: "Trends",
            value: "Stable",
            change: "+0.5%",
            changeType: "positive",
            icon: TrendingUp,
          },
        ]
        setStats(newStats)

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, []) // Dependency array remains empty to run once on mount
  
  const firstName = user?.firstName || '';
  
  const formattedAppointments = appointments.map(app => ({
    id: app.id,
    patient: `${app.patient.firstName} ${app.patient.lastName}`,
    time: new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    type: app.type || 'Consultation',
    status: app.status || 'confirmed',
  }));

  if (loading) {
    <Loading />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Dashboard Overview</h1>
          <p className="text-muted-foreground text-pretty">
            Welcome back, Dr. {firstName}. Here's what's happening at your clinic today.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <UserPlus className="h-4 w-4 mr-2" />
            New Patient
          </Button>
          <Button variant="outline">
            <CalendarPlus className="h-4 w-4 mr-2" />
            Schedule
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  <span className={stat.changeType === "positive" ? "text-green-600" : "text-red-600"}>
                    {stat.change}
                  </span>{" "}
                  from last month
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* NEW PATIENTS CARD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserPlus className="h-5 w-5 mr-2" />
              New Patients
            </CardTitle>
            <CardDescription>Recently added patient records.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {newPatients.length > 0 ? (
                newPatients.map((patient) => (
                  <div key={patient.id} className="flex items-start justify-between space-x-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-blue-500" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{patient.firstName} {patient.lastName}</p>
                        <p className="text-xs text-muted-foreground">
                            Patient ID: {patient.id.slice(0, 8)}...
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{timeAgo(patient.createdAt)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground pt-4">No new patients recorded yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments (Kept the same) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Today's Appointments
            </CardTitle>
            <CardDescription>Scheduled appointments for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formattedAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{appointment.patient}</p>
                      <p className="text-xs text-muted-foreground">
                        {appointment.time} • {appointment.type}
                      </p>
                    </div>
                  </div>
                  <Badge variant={appointment.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                    {appointment.status}
                  </Badge>
                </div>
              ))}
              {formattedAppointments.length === 0 && (
                <p className="text-center text-muted-foreground pt-4">No appointments scheduled for today.</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full bg-transparent">
                View All Appointments
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <UserPlus className="h-6 w-6" />
              <span className="text-sm">Add Patient</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <CalendarPlus className="h-6 w-6" />
              <span className="text-sm">Book Appointment</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <FileText className="h-6 w-6" />
              <span className="text-sm">Generate Report</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2 bg-transparent">
              <Activity className="h-6 w-6" />
              <span className="text-sm">View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}