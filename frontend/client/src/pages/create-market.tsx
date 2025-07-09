import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertMarketSchema } from "@shared/schema";
import { MarketPreviewModal } from "@/components/market-preview-modal";
import { Users, Trophy, Star, Bitcoin, CloudUpload, Eye, Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWalletContext } from "@/contexts/WalletContext";
import { betlifyContractService } from "@/lib/contracts";


// Create a separate schema for form data with string dates
const createMarketFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  fullDescription: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
  marketType: z.string().default("binary"),
  startTime: z.string().min(1, "Start time is required"),
  lockTime: z.string().min(1, "Lock time is required"),
  resolutionDate: z.string().min(1, "Resolution date is required"),
  creatorFee: z.string().default("1.0"),
  minimumBet: z.string().default("1.0"),
  isActive: z.boolean().default(true),
}).refine((data: any) => {
  const startTime = new Date(data.startTime);
  const lockTime = new Date(data.lockTime);
  const resolutionDate = new Date(data.resolutionDate);
  const now = new Date();
  
  return startTime > now;
}, {
  message: "Start time must be in the future",
  path: ["startTime"],
}).refine((data: any) => {
  const startTime = new Date(data.startTime);
  const lockTime = new Date(data.lockTime);
  
  return lockTime > startTime;
}, {
  message: "Lock time must be after start time",
  path: ["lockTime"],
}).refine((data: any) => {
  const lockTime = new Date(data.lockTime);
  const resolutionDate = new Date(data.resolutionDate);
  
  return resolutionDate > lockTime;
}, {
  message: "Resolution date must be after lock time",
  path: ["resolutionDate"],
});

type CreateMarketForm = z.infer<typeof createMarketFormSchema>;

export default function CreateMarket() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { walletState } = useWalletContext();

  // Set toast function on contract services
  React.useEffect(() => {
    console.log('🔧 [CreateMarket] Setting toast functions on contract services');
    betlifyContractService.setToast(toast);
  }, [toast]);

  const form = useForm<CreateMarketForm>({
    resolver: zodResolver(createMarketFormSchema),
    mode: "onChange", // Enable real-time validation
    defaultValues: {
      title: "",
      description: "",
      fullDescription: "",
      category: "",
      imageUrl: "",
      marketType: "binary",
      startTime: "",
      lockTime: "",
      resolutionDate: "",
      creatorFee: "1.0",
      minimumBet: "1.0",
      isActive: true,
    },
  });

  const createMarketMutation = useMutation({
    mutationFn: async (data: CreateMarketForm) => {
      const response = await apiRequest("POST", "/api/markets", {
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        lockTime: new Date(data.lockTime).toISOString(),
        resolutionDate: new Date(data.resolutionDate).toISOString(),
      });
      return response.json();
    },
    onSuccess: (newMarket) => {
      queryClient.invalidateQueries({ queryKey: ["/api/markets"] });
      toast({
        title: "Market Created Successfully!",
        description: `Your market "${newMarket.title}" has been created.`,
      });
      setLocation("/");
    },
    onError: (error) => {
      console.error("Failed to create market:", error);
      toast({
        title: "Failed to Create Market",
        description: "There was an error creating your market. Please try again.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: CreateMarketForm) => {
    if (!walletState.isConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet before creating a market.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the contract service from contracts.ts
      const initialized = await betlifyContractService.initialize();
      if (!initialized) {
        toast({
          title: "Contract Error",
          description: "Failed to initialize contract service. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Convert string dates to Date objects for contract service
      const marketDataForContract = {
        title: data.title,
        description: data.description,
        startTime: new Date(data.startTime),
        lockTime: new Date(data.lockTime),
        resolutionDate: new Date(data.resolutionDate),
        creatorFee: data.creatorFee || "1.0",
        minimumBet: data.minimumBet || "1.0",
        poolId:2
      };

      // Create pool via contract
      const txHash = await betlifyContractService.createPool(marketDataForContract);
      console.log('Pool created via contract:', txHash);
      
      // Generate a unique ID for the bet
      const betId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create bet data for storage
      const betData = {
        id: betId,
        ...data,
        startTime: new Date(data.startTime).toISOString(),
        lockTime: new Date(data.lockTime).toISOString(),
        resolutionDate: new Date(data.resolutionDate).toISOString(),
        creator: walletState.address || "Unknown",
        createdAt: new Date().toISOString(),
        isActive: true,
        totalVolume: "0",
        totalBets: 0,
        txHash: txHash, // Store the transaction hash
      };

      // Store bet data in localStorage
      const existingBets = JSON.parse(localStorage.getItem('betlify_bets') || '[]');
      existingBets.push(betData);
      localStorage.setItem('betlify_bets', JSON.stringify(existingBets));

      // Show success message
      toast({
        title: "Market Created Successfully!",
        description: `Your market "${data.title}" has been created.`,
      });

      // Redirect to bet details page only on success
      setLocation(`/bet-details?id=${betId}`);
      
    } catch (error) {
      console.error('Market creation failed:', error);
      toast({
        title: "Creation Failed",
        description: "Failed to create market. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreview = async () => {
    const isValid = await form.trigger();
    if (isValid) {
      setShowPreview(true);
    } else {
      toast({
        title: "Form Validation Error",
        description: "Please fix all required fields before previewing.",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to a service like Cloudinary
      // For now, we'll create a local URL
      const url = URL.createObjectURL(file);
      form.setValue("imageUrl", url);
    }
  };

  const categories = [
    { id: "politics", label: "Politics", icon: Users, color: "text-red-400" },
    { id: "sports", label: "Sports", icon: Trophy, color: "text-green-400" },
    { id: "entertainment", label: "Entertainment", icon: Star, color: "text-yellow-400" },
    { id: "crypto", label: "Crypto", icon: Bitcoin, color: "text-blue-400" },
  ];

  return (
    <div className="min-h-screen bg-solana-dark text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Create Your Prediction Market</h1>
          <p className="text-gray-400 text-lg">Build custom prediction markets and monetize your community engagement</p>
        </div>

        {/* Wallet Connection Alert */}
        {!walletState.isConnected && (
          <Alert className="mb-6 border-yellow-500/20 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-400" />
            <AlertDescription className="text-yellow-200">
              Please connect your wallet to create a market. This ensures you can receive creator fees.
            </AlertDescription>
          </Alert>
        )}

        <Card className="bg-solana-gray/50 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Market Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Market Category */}
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Market Category *</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {categories.map((category) => (
                            <button
                              key={category.id}
                              type="button"
                              onClick={() => {
                                field.onChange(category.id);
                                setSelectedCategory(category.id);
                              }}
                              className={`p-3 rounded-lg border transition-all duration-200 text-center relative ${
                                field.value === category.id 
                                  ? 'border-solana-purple bg-solana-purple/20 shadow-lg shadow-solana-purple/20' 
                                  : 'border-white/20 hover:border-solana-purple/50 hover:bg-solana-purple/5'
                              }`}
                            >
                              {field.value === category.id && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-solana-purple rounded-full flex items-center justify-center">
                                  <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                              <category.icon className={`w-6 h-6 ${category.color} mx-auto mb-2`} />
                              <span className="text-white text-sm font-medium">{category.label}</span>
                            </button>
                          ))}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Market Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Market Title *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Will Bitcoin reach $100k by end of 2024?"
                          className="bg-white/10 border-white/20 text-white placeholder-gray-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Market Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Market Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Brief description of the market..."
                          className="bg-white/10 border-white/20 text-white placeholder-gray-500 resize-none"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Full Description */}
                <FormField
                  control={form.control}
                  name="fullDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Detailed Description & Resolution Criteria</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide detailed description and resolution criteria..."
                          className="bg-white/10 border-white/20 text-white placeholder-gray-500 resize-none"
                          rows={4}
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormDescription className="text-gray-500">
                        Specify how the market will be resolved and what sources will be used.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Market Image Upload */}
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Market Image</FormLabel>
                      <FormControl>
                        <div className="space-y-4">
                                                  <Input
                          placeholder="https://example.com/image.jpg"
                          className="bg-white/10 border-white/20 text-white placeholder-gray-500"
                          {...field}
                          value={field.value || ''}
                        />
                          <div 
                            className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-solana-purple/50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <CloudUpload className="w-8 h-8 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-400 mb-2">Click to upload an image</p>
                            <p className="text-sm text-gray-500">PNG, JPG, GIF up to 10MB</p>
                          </div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          {field.value && (
                            <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                              <img
                                src={field.value}
                                alt="Market preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Market Type */}
                <FormField
                  control={form.control}
                  name="marketType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Market Type</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-4"
                        >
                          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="binary" id="binary" />
                              <label htmlFor="binary" className="text-white font-medium cursor-pointer">
                                Yes/No Market
                              </label>
                            </div>
                            <p className="text-gray-400 text-sm mt-2">Simple binary outcome prediction</p>
                          </div>
                          <div className="bg-white/5 border border-white/20 rounded-lg p-4">
                            <div className="flex items-center space-x-3">
                              <RadioGroupItem value="multiple" id="multiple" />
                              <label htmlFor="multiple" className="text-white font-medium cursor-pointer">
                                Multiple Choice
                              </label>
                            </div>
                            <p className="text-gray-400 text-sm mt-2">Multiple possible outcomes</p>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Market Timeline */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Market Timeline</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="startTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Start Time *</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              className="bg-white/10 border-white/20 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            When trading begins
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lockTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Lock Time *</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              className="bg-white/10 border-white/20 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            When trading stops
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="resolutionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Resolution Date *</FormLabel>
                          <FormControl>
                            <Input
                              type="datetime-local"
                              className="bg-white/10 border-white/20 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            When outcome is determined
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Market Settings */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white">Market Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="creatorFee"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Creator Fee (%)</FormLabel>
                          <FormControl>
                                                    <Input
                          type="number"
                          placeholder="1.0"
                          min="0"
                          max="10"
                          step="0.1"
                          className="bg-white/10 border-white/20 text-white placeholder-gray-500"
                          {...field}
                          value={field.value || ''}
                        />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            Fee you earn from trading volume (0-10%)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="minimumBet"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-300">Minimum Bet (USDC)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="1.00"
                              min="0.1"
                              step="0.1"
                              className="bg-white/10 border-white/20 text-white placeholder-gray-500"
                              {...field}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Form Validation Summary */}
                {Object.keys(form.formState.errors).length > 0 && (
                  <Alert className="border-red-500/20 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-200">
                      <div className="font-semibold mb-2">Please fix the following errors:</div>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {Object.entries(form.formState.errors).map(([field, error]) => (
                          <li key={field}>
                            <span className="capitalize">{field.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span> {error?.message}
                          </li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    disabled={isSubmitting || createMarketMutation.isPending}
                    className="flex-1 border-white/20 text-white font-semibold hover:bg-white/10 disabled:opacity-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Market
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || createMarketMutation.isPending || !walletState.isConnected}
                    className="flex-1 gradient-solana text-black font-bold hover:opacity-90 disabled:opacity-50"
                  >
                    {isSubmitting || createMarketMutation.isPending ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Creating Market...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Market
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      <MarketPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onConfirm={() => {
          setShowPreview(false);
          form.handleSubmit(onSubmit)();
        }}
        marketData={form.getValues() as any}
        isLoading={createMarketMutation.isPending}
      />
    </div>
  );
}
