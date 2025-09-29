"use client"

import { useState, useEffect } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Search, Loader2, FileText, Calendar, User, Stethoscope, Save, X, Clock } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "~/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ClientReportPayloadSchema } from "~/lib/validations/report"

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  reason?: string;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    CNIC: string;
    dateOfBirth: string;
    gender: string;
    phone?: string;
  };
}

interface PatientReport {
  id: string;
  reportDate: string;
  chiefComplaint?: string | null;
  diagnosis: string;
  treatmentPlan?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  doctorId: string;
  patientId: string;
  appointmentId?: string | null;
  doctor: {
    firstName: string;
    lastName: string;
  };
}


type ReportFormValues = z.infer<typeof ClientReportPayloadSchema>;

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const calculateAge = (dateOfBirth: string) => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export function PatientReportsView() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [patientReports, setPatientReports] = useState<PatientReport[]>([])
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false)
  const [loadingReports, setLoadingReports] = useState(false)
  const [isAddingReport, setIsAddingReport] = useState(false)

  const reportForm = useForm<ReportFormValues>({
    resolver: zodResolver(ClientReportPayloadSchema),
    defaultValues: {
      chiefComplaint: "",
      diagnosis: "",
      treatmentPlan: "",
      notes: "",
      appointmentId: "",
    },
  })

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/appointments/my-appointments")
      if (!res.ok) {
        throw new Error("Failed to fetch appointments")
      }
      const data: Appointment[] = await res.json()
      setAppointments(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchPatientReports = async (patientId: string) => {
    setLoadingReports(true)
    try {
      const res = await fetch(`/api/patients/${patientId}/reports`)
      if (!res.ok) {
        throw new Error("Failed to fetch patient reports")
      }
      const data: PatientReport[] = await res.json()
      setPatientReports(data)
    } catch (error) {
      console.error("Error fetching reports:", error)
      alert("Failed to load patient reports.")
    } finally {
      setLoadingReports(false)
    }
  }

  const handleViewAppointment = async (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsReportsModalOpen(true)
    reportForm.reset({
      chiefComplaint: appointment.reason || "",
      diagnosis: "",
      treatmentPlan: "",
      notes: "",
      appointmentId: appointment.id,
    })
    await fetchPatientReports(appointment.patient.id)
  }

  const handleAddReport = async (values: ReportFormValues) => {
    if (!selectedAppointment) return

    setIsAddingReport(true)
    try {
      const payload = {
        ...values,
      }

      const res = await fetch(`/api/patients/${selectedAppointment.patient.id}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || "Failed to add report")
      }

      const newReport: PatientReport = await res.json()
      
      setPatientReports(prev => [newReport, ...prev])

      reportForm.reset({
        chiefComplaint: "",
        diagnosis: "",
        treatmentPlan: "",
        notes: "",
        appointmentId: selectedAppointment.id, // Keep appointmentId for next potential report
      })
      alert("Report added successfully!")
    } catch (error: any) {
      console.error("Error adding report:", error.message)
      alert(`Error adding report: ${error.message}`)
    } finally {
      setIsAddingReport(false)
    }
  }

  const filteredAppointments = appointments.filter((appointment) => {
    const patientName = `${appointment.patient.firstName} ${appointment.patient.lastName}`.toLowerCase()
    return (
      patientName.includes(searchTerm.toLowerCase()) ||
      appointment.patient.CNIC.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-2">Loading Appointments...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Patient Reports</h1>
          <p className="text-muted-foreground mt-1">View appointments and create medical reports</p>
        </div>
      </div>

      <Dialog open={isReportsModalOpen} onOpenChange={setIsReportsModalOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Patient Medical Reports</DialogTitle>
            <DialogDescription>
              View patient information and create medical reports
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Patient Name</p>
                  <p className="font-semibold text-lg">{selectedAppointment.patient.firstName} {selectedAppointment.patient.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CNIC</p>
                  <p className="font-semibold">{selectedAppointment.patient.CNIC}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-semibold">{formatDate(selectedAppointment.patient.dateOfBirth)} ({calculateAge(selectedAppointment.patient.dateOfBirth)} years)</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-semibold">{selectedAppointment.patient.gender}</p>
                </div>
                {selectedAppointment.patient.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-semibold">{selectedAppointment.patient.phone}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Appointment</p>
                  <p className="font-semibold">{formatDate(selectedAppointment.startTime)} at {formatTime(selectedAppointment.startTime)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Create New Report</h3>
                <Form {...reportForm}>
                  <form onSubmit={reportForm.handleSubmit(handleAddReport)} className="space-y-4">
                    <FormField
                      control={reportForm.control}
                      name="chiefComplaint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Chief Complaint</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Patient's main symptoms or concerns"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reportForm.control}
                      name="diagnosis"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Diagnosis *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Medical diagnosis"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reportForm.control}
                      name="treatmentPlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Treatment Plan</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Recommended treatments, medications, follow-up plan..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={reportForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Clinical observations, patient history, examination findings..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button type="submit" disabled={isAddingReport}>
                        {isAddingReport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        Save Report
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => reportForm.reset({
                            chiefComplaint: "",
                            diagnosis: "",
                            treatmentPlan: "",
                            notes: "",
                            appointmentId: selectedAppointment.id, // Preserve appointmentId on clear
                        })}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Clear
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold mb-4">Previous Reports ({patientReports.length})</h3>
                {loadingReports ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : patientReports.length > 0 ? (
                  <div className="space-y-3">
                    {patientReports.map((report) => (
                      <Card key={report.id} className="bg-muted/50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Dr. {report.doctor.firstName} {report.doctor.lastName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              <span>{formatDateTime(report.reportDate)}</span>
                            </div>
                          </div>

                          {report.chiefComplaint && (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Chief Complaint:</p>
                              <p className="text-sm">{report.chiefComplaint}</p>
                            </div>
                          )}

                          <div className="mb-2">
                            <p className="text-xs font-semibold text-muted-foreground mb-1">Diagnosis:</p>
                            <p className="text-sm font-medium">{report.diagnosis}</p>
                          </div>

                          {report.treatmentPlan && (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Treatment Plan:</p>
                              <p className="text-sm whitespace-pre-wrap">{report.treatmentPlan}</p>
                            </div>
                          )}

                          {report.notes && (
                            <div className="mb-2">
                              <p className="text-xs font-semibold text-muted-foreground mb-1">Notes:</p>
                              <p className="text-sm whitespace-pre-wrap">{report.notes}</p>
                            </div>
                          )}

                          {report.updatedAt !== report.createdAt && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Last updated: {formatDateTime(report.updatedAt)}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>No medical reports found for this patient.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name, CNIC, or status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My Appointments ({filteredAppointments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          {filteredAppointments.length > 0 ? (
            <div className="space-y-2">
              {filteredAppointments.map((appointment) => (
                <Card 
                  key={appointment.id} 
                  className="hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handleViewAppointment(appointment)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{appointment.patient.firstName} {appointment.patient.lastName}</p>
                          <p className="text-sm text-muted-foreground">{appointment.patient.CNIC}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {calculateAge(appointment.patient.dateOfBirth)} years • {appointment.patient.gender}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{formatDate(appointment.startTime)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock className="h-4 w-4" />
                            <span>{formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}</span>
                          </div>
                        </div>
                        <Badge variant={appointment.status === "Scheduled" ? "default" : "secondary"}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                    {appointment.reason && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-xs text-muted-foreground">Reason:</p>
                        <p className="text-sm">{appointment.reason}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm
                ? "No appointments match your search."
                : "No appointments found."}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}