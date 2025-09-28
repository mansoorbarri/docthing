import { DashboardLayout } from "~/components/dashboard-layout"
import { PatientsView } from "~/components/patients-view"

export default function PatientsPage() {
  return (
    <DashboardLayout>
      <PatientsView />
    </DashboardLayout>
  )
}
