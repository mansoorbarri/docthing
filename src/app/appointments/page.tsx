import { DashboardLayout } from "~/components/dashboard-layout"
import { AppointmentsView } from "~/components/appointments-view"

export default function PatientsPage() {
  return (
    <DashboardLayout>
      <AppointmentsView />
    </DashboardLayout>
  )
}
