import { DashboardLayout } from "~/components/dashboard-layout"
import { PatientReportsView } from "~/components/patient-notes"

export default function PatientsPage() {
  return (
    <DashboardLayout>
      <PatientReportsView />
    </DashboardLayout>
  )
}