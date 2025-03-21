import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
// import { OnboardingCarousel } from "../../components/OnboardingCarousel";

export default function Onboarding() {
  return (
    <div className="bg-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to Inpact</h1>
          <p className="mt-2 text-gray-600">
            Let's get you started with your profile setup
          </p>
        </div>

        <Tabs defaultValue="influencer" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="influencer">I'm an Influencer</TabsTrigger>
            <TabsTrigger value="brand">I'm a Brand</TabsTrigger>
          </TabsList>

          <TabsContent value="influencer">
          </TabsContent>

          <TabsContent value="brand">
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}