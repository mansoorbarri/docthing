"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Loader2, Calendar } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "~/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { appointmentSchema, updateAppointmentSchema } from "~/lib/validations/appointment"

interface Doctor {
  id: string;
  clerkId: string;
  firstName: string;
  lastName: string;
  specialty?: string;
}

interface PatientForAppointment {
  id: string;
  firstName: string;
  lastName: string;
  CNIC: string;
}

interface Appointment {
  id: string
  startTime: string
  endTime: string
  status: string
  reason?: string
  doctor: {
    firstName: string
    lastName: string
  }
  patient: {
    firstName: string
    lastName: string
    CNIC: string
  }
}

interface AppointmentDetails extends Appointment {
  doctorId: string;
  patientId: string;
  reportId?: string | null;
  patient: PatientForAppointment;
  doctor: Doctor;
}

type NewAppointmentFormValues = z.infer<typeof appointmentSchema>
type UpdateAppointmentFormValues = z.infer<typeof updateAppointmentSchema>

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

const formatDateTimeForInput = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function AppointmentsView() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDetails | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [appointmentToEdit, setAppointmentToEdit] = useState<AppointmentDetails | null>(null);
  const [loadingAppointment, setLoadingAppointment] = useState(false);

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<PatientForAppointment[]>([]);

  const [appointmentCache, setAppointmentCache] = useState<Record<string, AppointmentDetails>>({});

  const newAppointmentForm = useForm<NewAppointmentFormValues>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      doctorId: "",
      patientId: "",
      startTime: "",
      endTime: "",
      reason: "",
      status: "Scheduled",
      reportId: "",
    },
  })

  const editAppointmentForm = useForm<UpdateAppointmentFormValues>({
    resolver: zodResolver(updateAppointmentSchema),
  })

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/appointments")
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

  const fetchDoctorsAndPatients = async () => {
    try {
      const doctorsRes = await fetch("/api/doctors");
      const doctorsData: Doctor[] = await doctorsRes.json();
      setDoctors(doctorsData);

      const patientsRes = await fetch("/api/patients?_fields=id,firstName,lastName,CNIC");
      const patientsData: PatientForAppointment[] = await patientsRes.json();
      setPatients(patientsData);

    } catch (error) {
      console.error("Failed to fetch doctors or patients:", error);
    }
  }

  useEffect(() => {
    fetchAppointments();
    fetchDoctorsAndPatients();
  }, [])

  const handleNewAppointmentSubmit = async (values: NewAppointmentFormValues) => {
    try {
      const res = await fetch("/api/appointments", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add new appointment.");
      }

      const newAppointment: Appointment = await res.json();
      fetchAppointments();
      newAppointmentForm.reset();
      setIsNewModalOpen(false);

      console.log("Appointment added successfully:", newAppointment);

    } catch (error: any) {
      console.error("Submission error:", error.message);
      alert(`Error adding appointment: ${error.message}`);
    }
  }

  const handleDeleteAppointment = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to delete this appointment record?")) {
      return;
    }

    setIsDeleting(appointmentId);
    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error("Failed to delete appointment");
      }

      setAppointments(prev => prev.filter(p => p.id !== appointmentId));
      setAppointmentCache(prev => {
        const { [appointmentId]: _, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      console.error("Deletion error:", error);
      alert("Failed to delete appointment. Check console for details.");
    } finally {
      setIsDeleting(null);
    }
  }

  const fetchAppointmentDetails = async (appointmentId: string): Promise<AppointmentDetails> => {
    if (appointmentCache[appointmentId]) {
      console.log(`Cache hit for appointment ${appointmentId}`);
      return appointmentCache[appointmentId];
    }

    console.log(`Cache miss for appointment ${appointmentId}. Fetching...`);
    const res = await fetch(`/api/appointments/${appointmentId}`);

    if (!res.ok) {
      throw new Error("Failed to fetch appointment details");
    }

    const data: AppointmentDetails = await res.json();

    setAppointmentCache(prev => ({
      ...prev,
      [appointmentId]: data
    }));

    return data;
  }

  const handleViewAppointment = async (appointmentId: string) => {
    setLoadingAppointment(true);
    setIsViewModalOpen(true);
    setSelectedAppointment(null);

    try {
      const data = await fetchAppointmentDetails(appointmentId);
      setSelectedAppointment(data);
    } catch (error) {
      console.error("Error fetching appointment:", error);
      alert("Failed to load appointment details.");
      setIsViewModalOpen(false);
    } finally {
      setLoadingAppointment(false);
    }
  }

  const handleEditAppointment = async (appointmentId: string) => {
    setLoadingAppointment(true);
    setIsEditModalOpen(true);
    setAppointmentToEdit(null);

    try {
      const data = await fetchAppointmentDetails(appointmentId);
      setAppointmentToEdit(data);

      editAppointmentForm.reset({
        ...data,
        startTime: formatDateTimeForInput(data.startTime),
        endTime: formatDateTimeForInput(data.endTime),
        reportId: data.reportId || "",
        status: data.status || "Scheduled",
        reason: data.reason || "",
      });
    } catch (error) {
      console.error("Error fetching appointment for edit:", error);
      alert("Failed to load appointment details for editing.");
      setIsEditModalOpen(false);
    } finally {
      setLoadingAppointment(false);
    }
  }

  const handleUpdateAppointmentSubmit = async (values: UpdateAppointmentFormValues) => {
    if (!appointmentToEdit) return;

    try {
      const res = await fetch(`/api/appointments/${appointmentToEdit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update appointment.");
      }

      const updatedAppointment: AppointmentDetails = await res.json();

      fetchAppointments();
      setAppointmentCache(prev => ({
        ...prev,
        [updatedAppointment.id]: updatedAppointment
      }));

      setIsEditModalOpen(false);

      console.log("Appointment updated successfully:", updatedAppointment);

    } catch (error: any) {
      console.error("Update error:", error.message);
      alert(`Error updating appointment: ${error.message}`);
    }
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const patientFullName = `${appointment.patient.firstName} ${appointment.patient.lastName}`.toLowerCase()
      const doctorFullName = `${appointment.doctor.firstName} ${appointment.doctor.lastName}`.toLowerCase()
      const matchesSearch =
        patientFullName.includes(searchTerm.toLowerCase()) ||
        doctorFullName.includes(searchTerm.toLowerCase()) ||
        appointment.patient.CNIC.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointment.status.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "all" || statusFilter === "" || appointment.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus
    })
  }, [appointments, searchTerm, statusFilter])

  const activeCount = appointments.length;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-2">Loading Appointment Records...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Appointment Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage and view all patient appointments</p>
        </div>

        <Button onClick={() => setIsNewModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Appointment</span>
        </Button>
      </div>

      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Enter appointment details, including patient, doctor, and time.
            </DialogDescription>
          </DialogHeader>
          <Form {...newAppointmentForm}>
            <form onSubmit={newAppointmentForm.handleSubmit(handleNewAppointmentSubmit)} className="space-y-4">
              <FormField
                control={newAppointmentForm.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {patients.map(p => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.firstName} {p.lastName} ({p.CNIC})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={newAppointmentForm.control}
                name="doctorId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Doctor</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {doctors.map(d => (
                          <SelectItem key={d.id} value={d.clerkId}>
                            Dr. {d.firstName} {d.lastName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={newAppointmentForm.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newAppointmentForm.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl><Input type="datetime-local" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={newAppointmentForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                        <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                        <SelectItem value="No Show">No Show</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newAppointmentForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason</FormLabel>
                    <FormControl><Input placeholder="Reason for appointment" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newAppointmentForm.control}
                name="reportId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Linked Report ID (Optional)</FormLabel>
                    <FormControl><Input placeholder="e.g., rep_abc123" {...field} /></FormControl>
                    <FormDescription>
                      Leave empty if no report is associated yet.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="submit" disabled={newAppointmentForm.formState.isSubmitting}>
                  {newAppointmentForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Schedule Appointment
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Appointment Record</DialogTitle>
            <DialogDescription>
              Update appointment details.
            </DialogDescription>
          </DialogHeader>

          {loadingAppointment && !appointmentToEdit ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading appointment data...</span>
            </div>
          ) : appointmentToEdit ? (
            <Form {...editAppointmentForm}>
              <form onSubmit={editAppointmentForm.handleSubmit(handleUpdateAppointmentSubmit)} className="space-y-4">
                <FormField
                  control={editAppointmentForm.control}
                  name="patientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Patient</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {patients.map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.firstName} {p.lastName} ({p.CNIC})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editAppointmentForm.control}
                  name="doctorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Doctor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {doctors.map(d => (
                            <SelectItem key={d.id} value={d.clerkId}>
                              Dr. {d.firstName} {d.lastName} {d.specialty ? `(${d.specialty})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editAppointmentForm.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editAppointmentForm.control}
                    name="endTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl><Input type="datetime-local" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editAppointmentForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Scheduled">Scheduled</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                          <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                          <SelectItem value="No Show">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editAppointmentForm.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason</FormLabel>
                      <FormControl><Input placeholder="Reason for appointment" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editAppointmentForm.control}
                  name="reportId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Linked Report ID (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g., rep_abc123" {...field} /></FormControl>
                      <FormDescription>
                        Leave empty if no report is associated yet.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={editAppointmentForm.formState.isSubmitting}>
                    {editAppointmentForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
            <DialogDescription>
              Comprehensive information about the appointment.
            </DialogDescription>
          </DialogHeader>

          {loadingAppointment && !selectedAppointment ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedAppointment ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Patient</p>
                  <p className="font-semibold">{selectedAppointment.patient.firstName} {selectedAppointment.patient.lastName}</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.patient.CNIC}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doctor</p>
                  <p className="font-semibold">Dr. {selectedAppointment.doctor.firstName} {selectedAppointment.doctor.lastName}</p>
                  <p className="text-sm text-muted-foreground">{selectedAppointment.doctor.specialty || 'General Practitioner'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Start Time</p>
                  <p className="font-semibold">
                    {formatDate(selectedAppointment.startTime)} at {formatTime(selectedAppointment.startTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">End Time</p>
                  <p className="font-semibold">
                    {formatDate(selectedAppointment.endTime)} at {formatTime(selectedAppointment.endTime)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <Badge className="font-semibold w-fit">{selectedAppointment.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reason</p>
                  <p className="text-sm">{selectedAppointment.reason || 'N/A'}</p>
                </div>
                {selectedAppointment.reportId && (
                  <div className="col-span-1 md:col-span-2">
                    <p className="text-sm text-muted-foreground">Linked Report ID</p>
                    <p className="font-mono text-sm">{selectedAppointment.reportId}</p>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by patient/doctor name, CNIC, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-auto">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Rescheduled">Rescheduled</SelectItem>
                  <SelectItem value="No Show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Appointments ({filteredAppointments.length})</span>
            <Badge variant="secondary" className="text-xs">
              {activeCount} Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="font-semibold">Patient</TableHead>
                  <TableHead className="font-semibold">Doctor</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Time</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        {appointment.patient.firstName} {appointment.patient.lastName}
                        <p className="text-muted-foreground text-xs">{appointment.patient.CNIC}</p>
                      </TableCell>
                      <TableCell className="font-medium">
                        Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(appointment.startTime)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className="text-xs"
                          variant={
                            appointment.status === "Scheduled"
                              ? "default"
                              : appointment.status === "Completed"
                                ? "secondary"
                                : appointment.status === "Cancelled"
                                  ? "destructive"
                                  : "secondary"
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            title="Edit"
                            onClick={() => handleEditAppointment(appointment.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteAppointment(appointment.id)}
                            disabled={isDeleting === appointment.id}
                            title="Delete"
                          >
                            {isDeleting === appointment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      {searchTerm || statusFilter !== 'all'
                        ? "No appointments match your current filter."
                        : "No appointment records found in the system."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
