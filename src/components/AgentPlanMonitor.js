import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Eye, 
  Edit, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  Brain, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { toast } from "react-hot-toast";

export default function AgentPlanMonitor({ 
  isProcessing = false, 
  onPlanUpdate,
  currentInput = "",
  summarizationOptions = {}
}) {
  const [planSteps, setPlanSteps] = useState([
    {
      id: 1,
      title: "Text Analysis",
      description: "Analyze input text structure and content",
      status: "pending", // pending, active, completed, error
      progress: 0,
      estimatedTime: "2s",
      details: "Identifying key themes, structure, and content type"
    },
    {
      id: 2,
      title: "Content Processing",
      description: "Apply summarization strategy based on user preferences",
      status: "pending",
      progress: 0,
      estimatedTime: "3s",
      details: "Processing text according to length, format, and focus settings"
    },
    {
      id: 3,
      title: "Summary Generation",
      description: "Generate summary using AI model",
      status: "pending",
      progress: 0,
      estimatedTime: "4s",
      details: "Creating coherent summary with selected parameters"
    },
    {
      id: 4,
      title: "Quality Review",
      description: "Review and optimize generated summary",
      status: "pending",
      progress: 0,
      estimatedTime: "1s",
      details: "Ensuring summary quality and coherence"
    }
  ]);

  const [isEditMode, setIsEditMode] = useState(false);
  const [customPlan, setCustomPlan] = useState("");
  const [editingStep, setEditingStep] = useState(null);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [planPreferences, setPlanPreferences] = useState({
    strategy: "balanced",
    priority: "accuracy",
    complexity: "medium"
  });

  useEffect(() => {
    if (isProcessing) {
      executeSimulatedPlan();
    } else {
      setPlanSteps(prev => prev.map(step => ({
        ...step,
        status: "pending",
        progress: 0
      })));
    }
  }, [isProcessing]);

  const executeSimulatedPlan = async () => {
    const steps = [...planSteps];
    
    for (let i = 0; i < steps.length; i++) {
      // Set current step as active
      steps[i].status = "active";
      setPlanSteps([...steps]);
      
      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        steps[i].progress = progress;
        setPlanSteps([...steps]);
      }
      
      // Mark as completed
      steps[i].status = "completed";
      steps[i].progress = 100;
      setPlanSteps([...steps]);
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "active":
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-gray-100 text-gray-600",
      active: "bg-blue-100 text-blue-700",
      completed: "bg-green-100 text-green-700",
      error: "bg-red-100 text-red-700"
    };

    return (
      <Badge className={`${colors[status]} border-0 text-xs`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleEditStep = (step) => {
    setEditingStep({ ...step });
  };

  const handleSaveStep = () => {
    setPlanSteps(prev => prev.map(step => 
      step.id === editingStep.id ? editingStep : step
    ));
    setEditingStep(null);
    toast.success("Step updated successfully");
  };

  const handleAddStep = () => {
    const newStep = {
      id: Math.max(...planSteps.map(s => s.id)) + 1,
      title: "New Step",
      description: "Custom step description",
      status: "pending",
      progress: 0,
      estimatedTime: "1s",
      details: "Custom step details"
    };
    setPlanSteps(prev => [...prev, newStep]);
  };

  const handleDeleteStep = (stepId) => {
    setPlanSteps(prev => prev.filter(step => step.id !== stepId));
    toast.success("Step removed successfully");
  };

  const handlePlanPreferenceChange = (key, value) => {
    setPlanPreferences(prev => ({ ...prev, [key]: value }));
    onPlanUpdate?.({ ...planPreferences, [key]: value });
  };

  const resetPlan = () => {
    setPlanSteps(prev => prev.map(step => ({
      ...step,
      status: "pending",
      progress: 0
    })));
    toast.success("Plan reset successfully");
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex flex-col">
          <div>
            <CardTitle className="flex items-center gap-2 mb-2">
              Agent Plan Monitor
            </CardTitle>
            <CardDescription>Monitor & customize summarization process</CardDescription>
          </div>
          <div className="flex w-full justify-end gap-2 mt-2">
            <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-1" />
                  Configure
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Plan Configuration</DialogTitle>
                  <DialogDescription>
                    Customize how the agent processes your summarization requests
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Strategy</label>
                      <Select 
                        value={planPreferences.strategy} 
                        onValueChange={(value) => handlePlanPreferenceChange('strategy', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fast">Fast</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                          <SelectItem value="thorough">Thorough</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Priority</label>
                      <Select 
                        value={planPreferences.priority} 
                        onValueChange={(value) => handlePlanPreferenceChange('priority', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="speed">Speed</SelectItem>
                          <SelectItem value="accuracy">Accuracy</SelectItem>
                          <SelectItem value="creativity">Creativity</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Complexity</label>
                      <Select 
                        value={planPreferences.complexity} 
                        onValueChange={(value) => handlePlanPreferenceChange('complexity', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="simple">Simple</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="outline" size="sm" onClick={resetPlan}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        <Tabs defaultValue="monitor" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="monitor">Monitor</TabsTrigger>
            <TabsTrigger value="edit">Edit Plan</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="monitor" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-3">
                {planSteps.map((step, index) => (
                  <Card key={step.id} className={`transition-all ${
                    step.status === 'active' ? 'ring-2 ring-blue-500' : ''
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(step.status)}
                          <span className="font-medium text-sm">{step.title}</span>
                          {getStatusBadge(step.status)}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Est. {step.estimatedTime}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {step.description}
                      </p>
                      
                      {step.status === 'active' || step.status === 'completed' ? (
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-300 ${
                              step.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${step.progress}%` }}
                          />
                        </div>
                      ) : null}
                      
                      <div className="text-xs text-muted-foreground">
                        {step.details}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="edit" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Customize Plan Steps</h3>
                  <Button size="sm" onClick={handleAddStep}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Step
                  </Button>
                </div>
                
                {planSteps.map((step, index) => (
                  <Card key={step.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono bg-muted px-2 py-1 rounded">
                              {index + 1}
                            </span>
                            <Input 
                              value={step.title}
                              className="font-medium text-sm border-0 px-0 h-auto"
                              onChange={(e) => {
                                const newSteps = [...planSteps];
                                newSteps[index].title = e.target.value;
                                setPlanSteps(newSteps);
                              }}
                            />
                          </div>
                          <Textarea
                            value={step.description}
                            className="text-sm border-0 px-0 min-h-[60px] resize-none"
                            onChange={(e) => {
                              const newSteps = [...planSteps];
                              newSteps[index].description = e.target.value;
                              setPlanSteps(newSteps);
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-1 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStep(step)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteStep(step.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="insights" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Current Configuration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Strategy:</span>
                        <Badge variant="outline">{planPreferences.strategy}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Priority:</span>
                        <Badge variant="outline">{planPreferences.priority}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Complexity:</span>
                        <Badge variant="outline">{planPreferences.complexity}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Input Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Text length:</span>
                        <span className="text-muted-foreground">
                          {currentInput.length.toLocaleString()} chars
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated processing time:</span>
                        <span className="text-muted-foreground">
                          {Math.max(5, Math.floor(currentInput.length / 1000))}s
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Complexity level:</span>
                        <Badge variant="outline" className="text-xs">
                          {currentInput.length > 5000 ? 'High' : 
                           currentInput.length > 1000 ? 'Medium' : 'Low'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Processing History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p>• Last run completed in 8.2s</p>
                      <p>• Average processing time: 7.1s</p>
                      <p>• Success rate: 98.5%</p>
                      <p>• Total summaries generated: 12</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>

      {editingStep && (
        <Dialog open={!!editingStep} onOpenChange={() => setEditingStep(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Step</DialogTitle>
              <DialogDescription>
                Customize the details of this processing step
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingStep.title}
                  onChange={(e) => setEditingStep(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={editingStep.description}
                  onChange={(e) => setEditingStep(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Details</label>
                <Textarea
                  value={editingStep.details}
                  onChange={(e) => setEditingStep(prev => ({ ...prev, details: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estimated Time</label>
                <Input
                  value={editingStep.estimatedTime}
                  onChange={(e) => setEditingStep(prev => ({ ...prev, estimatedTime: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingStep(null)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveStep}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}