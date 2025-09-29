import { DashboardLayout } from "~/components/dashboard-layout";
import { PatientsView } from "~/components/patients-view";

export default function PatientsPage({ params }: { params: { id: string } }) {
    return (
        <DashboardLayout>
            <PatientsView />
        </DashboardLayout>
    )  
}   