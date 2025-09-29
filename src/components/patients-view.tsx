"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Loader2, Users } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { patientSchema, updatePatientSchema } from "~/lib/validations/patient"

type NewPatientFormValues = z.infer<typeof patientSchema>
type UpdatePatientFormValues = z.infer<typeof updatePatientSchema>

interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'Male' | 'Female' | 'Other'
  phone: string
  email?: string
  address: string
  CNIC: string
  lastAppointment?: string
  createdAt?: string
  updatedAt?: string
}

interface PatientDetails extends Patient {
  appointments?: Array<{
    id: string
    startTime: string
    endTime: string
    status: string
    reason?: string
  }>
  patientReports?: Array<{
    id: string
    reportDate: string
    reportType: string
    findings?: string
  }>
  prescriptions?: Array<{
    id: string
    datePrescribed: string
    medication: string
    dosage?: string
  }>
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

const formatIsoDate = (dateString: string) => {
    return new Date(dateString).toISOString().split('T')[0];
}

export function PatientsView() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetails | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<PatientDetails | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);

  // NEW: In-memory cache for patient details
  const [patientCache, setPatientCache] = useState<Record<string, PatientDetails>>({});

  const newPatientForm = useForm<NewPatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "Other", 
      phone: "",
      email: "",
      address: "",
      CNIC: "",
    },
  })

  const editPatientForm = useForm<UpdatePatientFormValues>({
    resolver: zodResolver(updatePatientSchema),
  })

  const fetchPatients = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/patients")
      if (!res.ok) {
        throw new Error("Failed to fetch patients")
      }
      const data: Patient[] = await res.json()
      setPatients(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleNewPatientSubmit = async (values: NewPatientFormValues) => {
    try {
      const res = await fetch("/api/patients", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add new patient.");
      }

      const newPatient: Patient = await res.json();
      
      setPatients(prev => [newPatient, ...prev]); 
      
      newPatientForm.reset();
      setIsNewModalOpen(false);
      
      console.log("Patient added successfully:", newPatient);

    } catch (error: any) {
      console.error("Submission error:", error.message);
      alert(`Error adding patient: ${error.message}`);
    }
  }

  const handleDeletePatient = async (patientId: string) => {
    if (!window.confirm("Are you sure you want to delete this patient record?")) {
      return;
    }

    setIsDeleting(patientId);
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error("Failed to delete patient");
      }

      setPatients(prev => prev.filter(p => p.id !== patientId));
      // Remove from cache upon successful deletion
      setPatientCache(prev => {
          const { [patientId]: _, ...rest } = prev;
          return rest;
      });
    } catch (error) {
      console.error("Deletion error:", error);
      alert("Failed to delete patient. Check console for details.");
    } finally {
      setIsDeleting(null);
    }
  }

  const fetchPatientDetails = async (patientId: string): Promise<PatientDetails> => {
    // Check cache first
    if (patientCache[patientId]) {
        console.log(`Cache hit for patient ${patientId}`);
        return patientCache[patientId];
    }
    
    // Cache miss: fetch from API
    console.log(`Cache miss for patient ${patientId}. Fetching...`);
    const res = await fetch(`/api/patients/${patientId}`);
    
    if (!res.ok) {
      throw new Error("Failed to fetch patient details");
    }
    
    const data: PatientDetails = await res.json();

    // Update cache
    setPatientCache(prev => ({
        ...prev,
        [patientId]: data
    }));
    
    return data;
  }

  const handleViewPatient = async (patientId: string) => {
    setLoadingPatient(true);
    setIsViewModalOpen(true);
    setSelectedPatient(null);
    
    try {
      const data = await fetchPatientDetails(patientId);
      setSelectedPatient(data);
    } catch (error) {
      console.error("Error fetching patient:", error);
      alert("Failed to load patient details.");
      setIsViewModalOpen(false);
    } finally {
      setLoadingPatient(false);
    }
  }

  const handleEditPatient = async (patientId: string) => {
    setLoadingPatient(true);
    setIsEditModalOpen(true);
    setPatientToEdit(null);

    try {
      const data = await fetchPatientDetails(patientId);
      setPatientToEdit(data);

      editPatientForm.reset({
        ...data,
        dateOfBirth: formatIsoDate(data.dateOfBirth),
      });
    } catch (error) {
      console.error("Error fetching patient for edit:", error);
      alert("Failed to load patient details for editing.");
      setIsEditModalOpen(false);
    } finally {
      setLoadingPatient(false);
    }
  }

  const handleUpdatePatientSubmit = async (values: UpdatePatientFormValues) => {
    if (!patientToEdit) return;

    try {
      const res = await fetch(`/api/patients/${patientToEdit.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to update patient.");
      }

      const updatedPatient: Patient = await res.json();
      
      setPatients(prev => prev.map(p => 
        p.id === updatedPatient.id ? { ...p, ...updatedPatient } : p
      )); 

      // Invalidate/Update the cache for the specific patient
      setPatientCache(prev => ({
          ...prev,
          [updatedPatient.id]: {
              ...(prev[updatedPatient.id] || {} as PatientDetails), // Use existing relations if present
              ...updatedPatient, // Overwrite basic patient data
          }
      }));
      
      setIsEditModalOpen(false);
      
      console.log("Patient updated successfully:", updatedPatient);

    } catch (error: any) {
      console.error("Update error:", error.message);
      alert(`Error updating patient: ${error.message}`);
    }
  }


  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        patient.CNIC.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesGender = genderFilter === "all" || patient.gender.toLowerCase() === genderFilter.toLowerCase()
      
      return matchesSearch && matchesGender
    })
  }, [patients, searchTerm, genderFilter])
  
  const activeCount = patients.length; 

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-2">Loading Patient Records...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Patient Directory</h1>
          <p className="text-muted-foreground mt-1">Manage and view all patient records</p>
        </div>
        
        <Button onClick={() => setIsNewModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Patient</span>
        </Button>
      </div>

      <Dialog open={isNewModalOpen} onOpenChange={setIsNewModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter the patient's full contact and medical details.
            </DialogDescription>
          </DialogHeader>
          <Form {...newPatientForm}>
            <form onSubmit={newPatientForm.handleSubmit(handleNewPatientSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={newPatientForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input placeholder="John" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newPatientForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input placeholder="Smith" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={newPatientForm.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newPatientForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={newPatientForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input placeholder="+1 555 123 4567" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={newPatientForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl><Input type="email" placeholder="john.smith@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={newPatientForm.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl><Input placeholder="123 Main St, Anytown, USA" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={newPatientForm.control}
                name="CNIC"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNIC (National ID)</FormLabel>
                    <FormControl><Input placeholder="12345-6789012-3" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="submit" disabled={newPatientForm.formState.isSubmitting}>
                  {newPatientForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Patient
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Patient Record</DialogTitle>
            <DialogDescription>
              Update the patient's contact or demographic details.
            </DialogDescription>
          </DialogHeader>
          
          {loadingPatient && !patientToEdit ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading patient data...</span>
            </div>
          ) : patientToEdit ? (
            <Form {...editPatientForm}>
              <form onSubmit={editPatientForm.handleSubmit(handleUpdatePatientSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editPatientForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl><Input placeholder="John" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editPatientForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl><Input placeholder="Smith" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editPatientForm.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <FormControl><Input type="date" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editPatientForm.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editPatientForm.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl><Input placeholder="+1 555 123 4567" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editPatientForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (Optional)</FormLabel>
                        <FormControl><Input type="email" placeholder="john.smith@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={editPatientForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl><Input placeholder="123 Main St, Anytown, USA" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editPatientForm.control}
                  name="CNIC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CNIC (National ID)</FormLabel>
                      <FormControl><Input placeholder="12345-6789012-3" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={editPatientForm.formState.isSubmitting}>
                    {editPatientForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
            <DialogTitle>Patient Details</DialogTitle>
            <DialogDescription>
              Complete medical record and history
            </DialogDescription>
          </DialogHeader>
          
          {loadingPatient && !selectedPatient ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedPatient ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-semibold">{formatDate(selectedPatient.dateOfBirth)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gender</p>
                  <p className="font-semibold">{selectedPatient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CNIC</p>
                  <p className="font-mono text-sm">{selectedPatient.CNIC}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-mono text-sm">{selectedPatient.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-sm">{selectedPatient.email || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="text-sm">{selectedPatient.address}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  Appointments
                  <Badge variant="secondary">{selectedPatient.appointments?.length || 0}</Badge>
                </h3>
                {selectedPatient.appointments && selectedPatient.appointments.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedPatient.appointments.map((apt) => (
                      <div key={apt.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{formatDate(apt.startTime)}</p>
                            <p className="text-sm text-muted-foreground">{apt.reason || 'No reason specified'}</p>
                          </div>
                          <Badge variant="outline">{apt.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No appointments recorded</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  Reports
                  <Badge variant="secondary">{selectedPatient.patientReports?.length || 0}</Badge>
                </h3>
                {selectedPatient.patientReports && selectedPatient.patientReports.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedPatient.patientReports.map((report) => (
                      <div key={report.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{report.reportType}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(report.reportDate)}</p>
                            {report.findings && (
                              <p className="text-sm mt-1">{report.findings}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No reports recorded</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  Prescriptions
                  <Badge variant="secondary">{selectedPatient.prescriptions?.length || 0}</Badge>
                </h3>
                {selectedPatient.prescriptions && selectedPatient.prescriptions.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedPatient.prescriptions.map((prescription) => (
                      <div key={prescription.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{prescription.medication}</p>
                            <p className="text-sm text-muted-foreground">{formatDate(prescription.datePrescribed)}</p>
                            {prescription.dosage && (
                              <p className="text-sm mt-1">Dosage: {prescription.dosage}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No prescriptions recorded</p>
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
                placeholder="Search patients by name or CNIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Patients ({filteredPatients.length})</span>
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
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Date of Birth</TableHead>
                  <TableHead className="font-semibold">Gender</TableHead>
                  <TableHead className="font-semibold">CNIC</TableHead>
                  <TableHead className="font-semibold">Phone</TableHead>
                  <TableHead className="font-semibold">Last Appointment</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{patient.firstName} {patient.lastName}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(patient.dateOfBirth)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {patient.gender}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{patient.CNIC}</TableCell>
                      <TableCell className="font-mono text-sm">{patient.phone}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {patient.lastAppointment ? formatDate(patient.lastAppointment) : (
                          <span className="text-xs italic">No appointments</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            title="View Details"
                            onClick={() => handleViewPatient(patient.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0"
                            title="Edit"
                            onClick={() => handleEditPatient(patient.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeletePatient(patient.id)}
                            disabled={isDeleting === patient.id}
                            title="Delete"
                          >
                            {isDeleting === patient.id ? (
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
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      {searchTerm || genderFilter !== 'all'
                        ? "No patients match your current filter."
                        : "No patient records found in the system."}
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