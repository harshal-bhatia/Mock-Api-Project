"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Zap, Code2, AlignLeft, Settings2, Server } from "lucide-react";
import { useCreateMock } from "@/hooks/use-mocks-api";
import { useLocalMocks } from "@/hooks/use-local-mocks";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const formSchema = z
  .object({
    inputMode: z.enum(["plain", "schema"]),
    description: z.string().optional(),
    schemaInput: z.string().optional(),
    path: z.string().optional(),
    delayMs: z.number().min(0).max(5000),
    errorRate: z.number().min(0).max(100),
    statusCode: z.number().min(100).max(599),
  })
  .superRefine((data, ctx) => {
    if (
      data.inputMode === "plain" &&
      (!data.description || data.description.trim().length < 3)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please describe the API response you want",
        path: ["description"],
      });
    }
    if (
      data.inputMode === "schema" &&
      (!data.schemaInput || data.schemaInput.trim().length === 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Schema input is required",
        path: ["schemaInput"],
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const router = useRouter();
  const { addMockId } = useLocalMocks();
  const [error, setError] = useState<string | null>(null);
  const createMock = useCreateMock();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      inputMode: "plain",
      description: "",
      schemaInput: "",
      path: "",
      delayMs: 0,
      errorRate: 0,
      statusCode: 200,
    },
  });

  const onSubmit = (values: FormValues) => {
    setError(null);
    createMock.mutate(
      {
        description: values.description,
        inputMode: values.inputMode,
        schemaInput:
          values.inputMode === "schema" ? values.schemaInput : undefined,
        path: values.path || undefined,
        delayMs: values.delayMs,
        errorRate: values.errorRate,
        statusCode: values.statusCode,
      },
      {
        onSuccess: (mock) => {
          addMockId(mock.id);
          router.push(`/mocks/${mock.id}`);
        },
        onError: (err) => {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to generate mock. Check your API keys.",
          );
        },
      },
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-primary text-xs font-mono mb-2">
          <Server className="w-3 h-3" />
          AI-Powered Mock Endpoints
        </div>
        <h1 className="text-4xl md:text-5xl font-mono font-bold tracking-tighter">
          Forge <span className="text-primary">live APIs</span> in seconds.
        </h1>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
          Describe your endpoint or paste a schema. Get a real URL returning
          realistic JSON — instantly.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs
            defaultValue="plain"
            onValueChange={(v) =>
              form.setValue("inputMode", v as "plain" | "schema")
            }
          >
            <TabsList className="w-full grid grid-cols-2 bg-card border border-border">
              <TabsTrigger
                value="plain"
                className="font-mono text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <AlignLeft className="w-4 h-4 mr-2" /> Plain English
              </TabsTrigger>
              <TabsTrigger
                value="schema"
                className="font-mono text-sm data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <Code2 className="w-4 h-4 mr-2" /> JSON Schema / TS Interface
              </TabsTrigger>
            </TabsList>

            <div className="mt-4 border border-border bg-card rounded-lg p-6">
              <TabsContent value="plain" className="mt-0">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs text-muted-foreground">
                        // Describe the API response you want
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g. A list of 5 e-commerce orders. Each order should have an id, customer name, product name, price in USD, status (pending/shipped/delivered), and a created_at date."
                          className="min-h-[180px] font-mono text-sm bg-background/60 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="schema" className="mt-0 space-y-4">
                <FormField
                  control={form.control}
                  name="schemaInput"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs text-muted-foreground">
                        // Paste your TypeScript interface or JSON schema
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`interface Order {\n  id: string\n  customer: string\n  total: number\n  status: 'pending' | 'shipped' | 'delivered'\n}`}
                          className="min-h-[140px] font-mono text-sm bg-background/60 resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-mono text-xs text-muted-foreground">
                        // Extra context (optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Generate 4 items, use Indian names and INR currency"
                          className="font-mono text-sm bg-background/60"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>
            </div>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-2 border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-muted-foreground">
                  <Settings2 className="w-4 h-4 text-primary" /> Behavior
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <FormField
                  control={form.control}
                  name="delayMs"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between mb-2">
                        <FormLabel className="text-xs text-muted-foreground">
                          Response Delay
                        </FormLabel>
                        <span className="text-xs font-mono text-primary">
                          {field.value}ms
                        </span>
                      </div>
                      <FormControl>
                        <Slider
                          min={0}
                          max={5000}
                          step={100}
                          defaultValue={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="errorRate"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex justify-between mb-2">
                        <FormLabel className="text-xs text-muted-foreground">
                          Error Rate (simulated 500s)
                        </FormLabel>
                        <span className="text-xs font-mono text-primary">
                          {field.value}%
                        </span>
                      </div>
                      <FormControl>
                        <Slider
                          min={0}
                          max={100}
                          step={5}
                          defaultValue={[field.value]}
                          onValueChange={(v) => field.onChange(v[0])}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-mono text-muted-foreground">
                  Endpoint
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="statusCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Status Code
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          className="font-mono text-sm bg-background/60"
                          {...field}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="path"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        Custom Label (optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="/api/orders"
                          className="font-mono text-sm bg-background/60"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {error && (
            <div className="border border-destructive/50 bg-destructive/10 rounded-lg p-4 text-sm text-destructive font-mono">
              ⚠ {error}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            disabled={createMock.isPending}
            className="w-full h-14 text-base font-mono font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_25px_rgba(0,240,255,0.25)] hover:shadow-[0_0_35px_rgba(0,240,255,0.4)] transition-all"
          >
            {createMock.isPending ? (
              <span className="flex items-center gap-3">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Generating with AI...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Zap className="w-5 h-5" /> GENERATE MOCK ENDPOINT
              </span>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
