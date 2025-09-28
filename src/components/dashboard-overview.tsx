"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Button } from "~/components/ui/button"
import { Badge } from "~/components/ui/badge"
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Activity,
  UserPlus,
  CalendarPlus,
  FileText,
  AlertCircle,
} from "lucide-react"

const stats = [
  {
    title: "Total Patients",
    value: "2,847",
    change: "+12%",
    changeType: "positive" as const,
    icon: Users,
  },
  {
    title: "Today's Appointments",
    value: "24",
    change: "+3",
    changeType: "positive" as const,
    icon: Calendar,
  },
  {
    title: "Pending Reviews",
    value: "8",
    change: "-2",
    changeType: "positive" as const,
    icon: Clock,
  },
  {
    title: "Monthly Revenue",
    value: "$45,231",
    change: "+8.2%",
    changeType: "positive" as const,
    icon: TrendingUp,
  },
]

const recentActivity = [
  {
    id: 1,
    type: "appointment",
    message: "New appointment scheduled with John Smith",
    time: "2 minutes ago",
    icon: CalendarPlus,
  },
  {
    id: 2,
    type: "patient",
    message: "Patient record updated for Maria Garcia",
    time: "15 minutes ago",
    icon: Users,
  },
  {
    id: 3,
    type: "report",
    message: "Monthly report generated successfully",
    time: "1 hour ago",
    icon: FileText,
  },
  {
    id: 4,
    type: "alert",
    message: "Appointment reminder sent to 12 patients",
    time: "2 hours ago",
    icon: AlertCircle,
  },
]

const upcomingAppointments = [
  {
    id: 1,
    patient: "John Smith",
    time: "9:00 AM",
    type: "Consultation",
    status: "confirmed",
  },
  {
    id: 2,
    patient: "Maria Garcia",
    time: "10:30 AM",
    type: "Follow-up",
    status: "confirmed",
  },
  {
    id: 3,
    patient: "David Wilson",
    time: "2:00 PM",
    type: "Check-up",
    status: "pending",
  },
  {
    id: 4,
    patient: "Sarah Brown",
    time: "3:30 PM",
    type: "Consultation",
    status: "confirmed",
  },
]

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Dashboard Overview</h1>
          <p className="text-muted-foreground text-pretty">
            Welcome back, Dr. Johnson. Here's what's happening at your clinic today.
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
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your clinic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Today's Appointments */}
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
              {upcomingAppointments.map((appointment) => (
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
