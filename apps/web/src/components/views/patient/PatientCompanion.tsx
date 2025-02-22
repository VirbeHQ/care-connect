'use client';

import {useCallback, useState} from 'react';
import {useRouter} from 'next/navigation'

import {Button} from '~/components/ui/button';
import {CheckCircle2, LayoutDashboard, MessageSquare, Phone} from 'lucide-react';
import {ConvAI} from "~/components/elements/ConvAI";
import {AGENT_OVERRIDES, PATIENT_AGENT_TOOLS} from "~/common/prompt";

import {useLocalStorage} from "@uidotdev/usehooks";
import {CompanionBlob} from "~/components/elements/CompanionBlob";
import {Role} from "@11labs/client";

interface ChecklistItem {
  id: string;
  time: string;
  title: string;
  completed: boolean;
}

export function PatientCompanion() {
  const [healthSymptoms, setHealthSymptoms] = useLocalStorage<string[]>('healthSymptoms', []);
  const [shoppingNeeds, setShoppingNeeds] = useLocalStorage<string[]>('shoppingNeeds', []);

  const [isListening, setIsListening] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("Hello! How can I help you today?");
  const router = useRouter();

  const [checklist] = useState<ChecklistItem[]>([
    {id: '1', time: '9:00 AM', title: 'Morning Brief', completed: false},
    {id: '2', time: '11:00 AM', title: 'Wellbeing Check', completed: false},
    {id: '3', time: '3:00 PM', title: 'Afternoon Wrap-up', completed: false},
  ]);

  const [dailyChecklist, setDailyChecklist] = useState(checklist);

  const onConvAIMessage = useCallback((message, source: Role) => {
    if (source === "ai") {
      setCurrentMessage(message);
    }
  }, []);

  const toggleChecklistItem = (id: string) => {
    setDailyChecklist(items =>
      items.map(item =>
        item.id === id ? {...item, completed: !item.completed} : item
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation Buttons */}
        <div className="flex justify-between mb-8">
          <Button
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => router.push('/patient/dashboard')}
          >
            <LayoutDashboard className="w-4 h-4"/>
            Dashboard
          </Button>
          <Button
            variant="default"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => window.alert('Starting caregiver call...')}
          >
            <Phone className="w-4 h-4"/>
            Call Caregiver
          </Button>
        </div>

        {/* Companion Blob */}
        <CompanionBlob currentMessage={currentMessage}/>

        <div className="flex justify-center mb-8">
          <ConvAI
            ctaButton={"Start morning check-in"}
            prompt={AGENT_OVERRIDES.PATIENT.prompt}
            firstMessage={AGENT_OVERRIDES.PATIENT.firstMessage}
            dynamicVariables={AGENT_OVERRIDES.PATIENT.defaultVariables}
            onMessage={onConvAIMessage}
            tools={
              {
                [PATIENT_AGENT_TOOLS.HealthSymptomDetected]: (params: { symptom: string }) => {
                  // console.log('HealthSymptomDetected: ' + params.symptom)
                  healthSymptoms.push(params.symptom);
                  setHealthSymptoms(healthSymptoms);
                },
                [PATIENT_AGENT_TOOLS.ShoppingNeed]: (params: { item: string }) => {
                  // console.log('ShoppingNeed: ' + params.item)
                  shoppingNeeds.push(params.item);
                  setShoppingNeeds(shoppingNeeds);
                },
              }
            }
          />
        </div>

        {/* Voice Control */}
        {/*<div className="flex justify-center mb-8">*/}
        {/*  <Button*/}
        {/*    size="lg"*/}
        {/*    variant={isListening ? "default" : "outline"}*/}
        {/*    className="rounded-full w-16 h-16 p-0"*/}
        {/*    onClick={() => setIsListening(!isListening)}*/}
        {/*  >*/}
        {/*    {isListening ? (*/}
        {/*      <MicOff className="w-6 h-6"/>*/}
        {/*    ) : (*/}
        {/*      <Mic className="w-6 h-6"/>*/}
        {/*    )}*/}
        {/*  </Button>*/}
        {/*</div>*/}


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Prompts */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Quick Prompts</h3>
              <MessageSquare className="w-6 h-6 text-blue-500"/>
            </div>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start text-left">
                Let's play a word game
              </Button>
              <Button variant="outline" className="w-full justify-start text-left">
                What's in today's news?
              </Button>
              <Button variant="outline" className="w-full justify-start text-left">
                How am I feeling today?
              </Button>
            </div>
          </div>

          {/* Health Symptoms */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Health Symptoms</h3>
              <CheckCircle2 className="w-6 h-6 text-green-500"/>
            </div>
            <ul className="space-y-3">
              {healthSymptoms.map((symptom, index) => (
                <li key={index} className="w-full justify-start text-left">
                  {symptom}
                </li>
              ))}
            </ul>
          </div>

          {/* Shopping list*/}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Shopping List</h3>
              <CheckCircle2 className="w-6 h-6 text-green-500"/>
            </div>
            <ul className="space-y-3">
              {shoppingNeeds.map((item, index) => (
                <li key={index} className="w-full justify-start text-left">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Daily Checklist */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Daily Checklist</h3>
              <CheckCircle2 className="w-6 h-6 text-green-500"/>
            </div>
            <div className="space-y-3">
              {dailyChecklist.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  className={`w-full justify-between ${item.completed ? 'bg-green-50' : ''}`}
                  onClick={() => toggleChecklistItem(item.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">{item.time}</span>
                    <span>{item.title}</span>
                  </div>
                  <CheckCircle2
                    className={`w-5 h-5 ${item.completed ? 'text-green-500' : 'text-gray-300'}`}
                  />
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
