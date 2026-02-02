import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users } from "lucide-react";
import CalendarSection from "./CalendarSection";
import GoogleCalendarPage from "./GoogleCalendarPage";
import GoogleIcon from "@/components/icons/GoogleIcon";
import PatientsPage from "./patients/PatientsPage";

interface AppointmentsPageProps {
  profileId: string;
}

const AppointmentsPage = ({ profileId }: AppointmentsPageProps) => {
  const [activeTab, setActiveTab] = useState<"calendars" | "patients" | "google">("calendars");

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="calendars" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendários</span>
          </TabsTrigger>
          <TabsTrigger value="patients" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Pacientes</span>
          </TabsTrigger>
          <TabsTrigger value="google" className="flex items-center gap-2">
            <GoogleIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Google</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendars" className="mt-4">
          <CalendarSection profileId={profileId} />
        </TabsContent>

        <TabsContent value="patients" className="mt-4">
          <PatientsPage profileId={profileId} />
        </TabsContent>

        <TabsContent value="google" className="mt-4">
          <GoogleCalendarPage profileId={profileId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AppointmentsPage;
