import { ContractFunction, categoryLabels } from "@/data/contract-functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BookOpen, Code, AlertTriangle, Zap, Eye } from "lucide-react";

interface FunctionCardProps {
  func: ContractFunction;
}

export function FunctionCard({ func }: FunctionCardProps) {
  const category = categoryLabels[func.category];
  const isWrite = func.type === "write";
  const isGov = func.name.startsWith("gov");

  return (
    <Card className="border border-border/50 hover:border-primary/30 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <CardTitle className="font-mono text-lg text-foreground">
              {func.name}
            </CardTitle>
            <Badge 
              variant="outline" 
              className={`${isWrite ? "border-orange-400 text-orange-600 bg-orange-50" : "border-green-400 text-green-600 bg-green-50"}`}
            >
              {isWrite ? <Zap className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
              {isWrite ? "Write" : "Read"}
            </Badge>
            {isGov && (
              <Badge variant="outline" className="border-pink-400 text-pink-600 bg-pink-50">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Gov Only
              </Badge>
            )}
          </div>
          <Badge className={`${category.bgColor} ${category.color} border-0`}>
            {category.label}
          </Badge>
        </div>
        
        <code className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded w-fit">
          {func.selector}
        </code>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Vietnamese Description */}
        <p className="text-foreground leading-relaxed">
          {func.descriptionVi}
        </p>

        <Accordion type="multiple" className="w-full">
          {/* Parameters */}
          {func.parameters && func.parameters.length > 0 && (
            <AccordionItem value="params" className="border-b-0">
              <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-cyan-500" />
                  Parameters ({func.parameters.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  {func.parameters.map((param, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <code className="text-violet-600 font-mono bg-violet-50 px-1.5 py-0.5 rounded">
                        {param.name}
                      </code>
                      <span className="text-muted-foreground">:</span>
                      <code className="text-cyan-600 font-mono">
                        {param.type}
                      </code>
                      <span className="text-muted-foreground">—</span>
                      <span className="text-foreground">{param.description}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Returns */}
          {func.returns && func.returns.length > 0 && (
            <AccordionItem value="returns" className="border-b-0">
              <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
                <span className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-green-500" />
                  Returns ({func.returns.length})
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-6">
                  {func.returns.map((ret, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <code className="text-green-600 font-mono bg-green-50 px-1.5 py-0.5 rounded">
                        {ret.name}
                      </code>
                      <span className="text-muted-foreground">:</span>
                      <code className="text-cyan-600 font-mono">
                        {ret.type}
                      </code>
                      <span className="text-muted-foreground">—</span>
                      <span className="text-foreground">{ret.description}</span>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Example */}
          {func.example && (
            <AccordionItem value="example" className="border-b-0">
              <AccordionTrigger className="text-sm font-medium py-2 hover:no-underline">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  Ví dụ Code
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg text-sm overflow-x-auto font-mono">
                  <code>{func.example}</code>
                </pre>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>

        {/* Note */}
        {func.note && (
          <div className="flex items-start gap-2 text-sm bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-amber-800">{func.note}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
