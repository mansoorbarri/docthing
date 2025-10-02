"use client"
import { DashboardLayout } from "~/components/dashboard-layout";
import { PatientReportsView } from "~/components/patient-notes";
import { useUser} from "@clerk/nextjs";
import { Loading } from "~/components/loading";

export default  function DoctorAppointmentNotesPage() {
    const {isLoaded, isSignedIn, user} = useUser();
    if (!isLoaded || !isSignedIn) {
        return <Loading />
    }
    if (user.publicMetadata.role !== 'doctor') {
        return <div>You are not authorized to view this page.</div>;
    }
    return (
        <DashboardLayout>
            <PatientReportsView />
        </DashboardLayout>
    );
}