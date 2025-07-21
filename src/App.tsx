import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Resultado = {
  nome: string;
  markup: number;
  custoMaterial: number;
  custoDepreciacao: number;
  custoEletricidade: number;
  custoFixoAdicional: number;
  valorManutencao: number;
  depreciacaoPorHora: number;
  horasTotais: number;
  custoImpressão: number;
  precoComLucro: number;
  precoFinal: number;
  percentualFalhas: number;
  imposto: number;
  taxaVendaOnline: number;
  margemLucro: number;
};

const formSchema = z.object({
  peso: z.number({ error: "Peso inválido" }).min(1, "Informe o peso"),
  custoPorKg: z.number({ error: "Custo inválido" }).min(0.01, "Custo inválido"),
  horas: z.number({ error: "Valor inválido" }).min(0, "Valor inválido"),
  minutos: z
    .number({ error: "Minutos inválido" })
    .min(0)
    .max(59, "Máx. 59 minutos"),
  valorImpressora: z
    .number({ error: "Valor inválido" })
    .min(1, "Informe o valor da impressora"),
  vidaUtilHoras: z
    .number({ error: "Vida útil inválida" })
    .min(1, "Informe a vida útil em horas"),
  custoEnergia: z
    .number({ error: "Valor inválido" })
    .min(0.01, "Informe o custo da energia"),
  margemLucro: z
    .number({ error: "Valor inválido" })
    .min(0, "Informe a margem de lucro"),
  custoFixoAdicional: z
    .number({ error: "Valor inválido" })
    .min(0, "Informe o custo adicional"),
  nome: z.string().min(1, "Informe o nome da peça"),
  potenciaImpressora: z
    .number({ error: "Potência inválida" })
    .min(0, "Informe a potência da impressora"),
  porcentCustoManutencao: z
    .number({ error: "Valor inválido" })
    .min(0, "Informe o custo de manutenção")
    .max(100, "Máx. 100%"),
  imposto: z
    .number({ error: "Valor inválido" })
    .min(0, "Informe o imposto")
    .max(100, "Máx. 100%"),
  taxaVendaOnline: z
    .number({ error: "Valor inválido" })
    .min(0, "Informe a taxa da plataforma de venda online")
    .max(100, "Máx. 100%"),
  percentualFalhas: z
    .number({ error: "Valor inválido" })
    .min(0, "Informe o percentual de falhas")
    .max(100, "Máx. 100%"),
});

export default function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      peso: 200,
      custoPorKg: 99.9,
      horas: 7,
      minutos: 30,
      valorImpressora: 1630,
      vidaUtilHoras: 5000,
      custoEnergia: 0.9,
      margemLucro: 50,
      custoFixoAdicional: 0,
      porcentCustoManutencao: 25,
      imposto: 8,
      taxaVendaOnline: 20,
      percentualFalhas: 15,
      potenciaImpressora: 400,
    },
  });

  const [resultado, setResultado] = useState<Resultado | null>(null);

  function calcular(data: z.infer<typeof formSchema>) {
    const {
      peso,
      custoPorKg,
      horas,
      minutos,
      valorImpressora,
      vidaUtilHoras,
      custoEnergia,
      margemLucro,
      custoFixoAdicional,
      nome,
      potenciaImpressora,
      porcentCustoManutencao,
      imposto,
      taxaVendaOnline,
      percentualFalhas,
    } = data;

    // Tempo total de impressão
    const horasTotais = horas + minutos / 60;

    // Custo do material
    const custoMaterial = (peso / 1000) * custoPorKg;

    // Custo de manutenção (percentual sobre valor da impressora)
    const valorManutencao = valorImpressora * (porcentCustoManutencao / 100);

    // Depreciação por hora (inclui manutenção)
    const depreciacaoPorHora =
      (valorImpressora + valorManutencao) / vidaUtilHoras;
    const custoDepreciacao = horasTotais * depreciacaoPorHora;

    // Consumo de energia (potência em W convertida para kW)
    const consumoEnergiaKw = (potenciaImpressora / 1000) * horasTotais;
    const custoEletricidade = consumoEnergiaKw * custoEnergia;

    // Custo fixo adicional
    // Percentual de falhas (aumenta o custo proporcionalmente)
    const fatorFalhas = 1 + percentualFalhas / 100;

    // custoImpressão antes de taxas e impostos
    const custoImpressão =
      (custoMaterial +
        custoDepreciacao +
        custoEletricidade +
        custoFixoAdicional) *
      fatorFalhas;
    console.log("Custo de impressão:", custoImpressão);

    // Margem de lucro
    const precoComLucro = custoImpressão * (1 + margemLucro / 100);

    // Imposto e taxa de venda online
    const markup = 1 / (1 - (imposto + taxaVendaOnline + margemLucro) / 100);
    const precoFinal = custoImpressão * markup;

    setResultado({
      nome,
      markup,
      custoMaterial,
      custoDepreciacao,
      custoEletricidade,
      custoFixoAdicional,
      valorManutencao,
      depreciacaoPorHora,
      horasTotais,
      custoImpressão,
      precoComLucro,
      precoFinal,
      percentualFalhas,
      imposto,
      taxaVendaOnline,
      margemLucro,
    });
  }
  return (
    <div className="w-full mx-auto p-6 grid-cols-3 grid space-x-4 md:max-w-10/12">
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3710342257752153"
      ></script>
      <div className="col-span-2">
        <h1 className="text-2xl font-bold">Calculadora de Impressão 3D</h1>
        <form
          onSubmit={handleSubmit(calcular)}
          className="grid grid-cols-6 space-y-4 space-x-4"
        >
          <Card className="w-full col-span-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Informações sobre a peça{" "}
                <div className="flex gap-2">
                  <Button type="submit">Calcular custo</Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      if (confirm()) {
                        reset();
                        setResultado(null);
                      }
                    }}
                  >
                    Limpar
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-6 space-y-4 space-x-4">
              <div className="col-span-2 space-y-2">
                <Label>Nome da peça</Label>
                <Input {...register("nome")} />
                {errors.nome && (
                  <p className="text-red-500 text-sm">{errors.nome.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Identificação da peça a ser impressa
                </p>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Peso da peça (g)</Label>
                <Input
                  type="number"
                  {...register("peso", { valueAsNumber: true })}
                />
                {errors.peso && (
                  <p className="text-red-500 text-sm">{errors.peso.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Peso total da peça em gramas
                </p>
              </div>
              <div className="col-span-1 space-y-2">
                <Label>Horas de impressão</Label>
                <Input {...register("horas", { valueAsNumber: true })} />
                {errors.horas && (
                  <p className="text-red-500 text-sm">{errors.horas.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Tempo de impressão em horas
                </p>
              </div>
              <div className="col-span-1 space-y-2">
                <Label>Minutos</Label>
                <Input {...register("minutos", { valueAsNumber: true })} />
                {errors.minutos && (
                  <p className="text-red-500 text-sm">
                    {errors.minutos.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Minutos adicionais ao tempo de impressão
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full col-span-6">
            <CardHeader>
              <CardTitle>Energia e materiais gastos</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-6 space-y-4 space-x-4">
              <div className="col-span-2 space-y-2">
                <Label>Custo por Kg do material (R$)</Label>
                <Input {...register("custoPorKg", { valueAsNumber: true })} />
                {errors.custoPorKg && (
                  <p className="text-red-500 text-sm">
                    {errors.custoPorKg.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Valor pago por cada quilo do material utilizado
                </p>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Potência da impressora (W)</Label>
                <Input
                  {...register("potenciaImpressora", { valueAsNumber: true })}
                />
                {errors.potenciaImpressora && (
                  <p className="text-red-500 text-sm">
                    {errors.potenciaImpressora.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Potência nominal da impressora em watts
                </p>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Custo da energia elétrica (R$/kWh)</Label>
                <Input {...register("custoEnergia", { valueAsNumber: true })} />
                {errors.custoEnergia && (
                  <p className="text-red-500 text-sm">
                    {errors.custoEnergia.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Valor pago por cada kWh consumido
                </p>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Consumo (kWh)</Label>
                <Input
                  type="number"
                  value={
                    watch("potenciaImpressora") > 0 &&
                    watch("horas") >= 0 &&
                    watch("minutos") >= 0
                      ? (
                          (Number(watch("potenciaImpressora")) / 1000) *
                          (Number(watch("horas")) +
                            Number(watch("minutos")) / 60)
                        ).toFixed(2)
                      : ""
                  }
                  readOnly
                  className="bg-gray-100"
                />
                <p className="text-xs text-muted-foreground">
                  Consumo médio de energia da impressora em kWh (potência x
                  tempo)
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full col-span-6">
            <CardHeader>
              <CardTitle>Informações sobre a impressora</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-6 space-y-4 space-x-4">
              <div className="col-span-2 space-y-2">
                <Label>Valor da impressora (R$)</Label>
                <Input
                  {...register("valorImpressora", { valueAsNumber: true })}
                />
                {errors.valorImpressora && (
                  <p className="text-red-500 text-sm">
                    {errors.valorImpressora.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Preço de compra da impressora
                </p>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Vida útil estimada (horas)</Label>
                <Input
                  {...register("vidaUtilHoras", { valueAsNumber: true })}
                />
                {errors.vidaUtilHoras && (
                  <p className="text-red-500 text-sm">
                    {errors.vidaUtilHoras.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Quantidade de horas que a impressora deve durar
                </p>
              </div>
              <div className="col-span-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Label> Custo de manutenção (%) </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="flex size-5" />
                      </TooltipTrigger>
                      <TooltipContent>
                        É calculado encima do preço da impressora
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input
                  {...register("porcentCustoManutencao", {
                    valueAsNumber: true,
                  })}
                />
                {errors.vidaUtilHoras && (
                  <p className="text-red-500 text-sm">
                    {errors.vidaUtilHoras.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Percentual do valor da impressora destinado à manutenção
                </p>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Custo de manutenção (R$)</Label>
                <Input
                  type="number"
                  value={
                    watch("valorImpressora") > 0 &&
                    watch("porcentCustoManutencao") > 0
                      ? (
                          Number(watch("valorImpressora")) *
                          (Number(watch("porcentCustoManutencao")) / 100)
                        ).toFixed(2)
                      : ""
                  }
                  readOnly
                  tabIndex={-1}
                  className="bg-gray-100"
                />
                <p className="text-xs text-muted-foreground">
                  Valor da impressora multiplicado pelo percentual de manutenção
                </p>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Depreciação da impressora (R$/h)</Label>
                <Input
                  type="number"
                  value={
                    watch("valorImpressora") > 0 && watch("vidaUtilHoras") > 0
                      ? (
                          (Number(watch("valorImpressora")) +
                            Number(watch("valorImpressora")) *
                              (Number(watch("porcentCustoManutencao")) / 100)) /
                          Number(watch("vidaUtilHoras"))
                        ).toFixed(2)
                      : ""
                  }
                  readOnly
                  tabIndex={-1}
                  className="bg-gray-100"
                />
                <p className="text-xs text-muted-foreground">
                  Valor da impressora dividido pela vida útil em horas
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="w-full col-span-6">
            <CardHeader>
              <CardTitle>Informações sobre a precificação e taxas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-6 space-y-4 space-x-4">
              <div className="col-span-2 space-y-2">
                <Label>% de falhas</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  {...register("percentualFalhas", { valueAsNumber: true })}
                />
                {errors.percentualFalhas && (
                  <p className="text-red-500 text-sm">
                    {errors.percentualFalhas.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Percentual estimado de peças que falham durante a impressão
                </p>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Imposto (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  {...register("imposto", { valueAsNumber: true })}
                />
                {errors.imposto && (
                  <p className="text-red-500 text-sm">
                    {errors.imposto.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Percentual de imposto sobre o preço de venda
                </p>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Taxa de venda online (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  {...register("taxaVendaOnline", { valueAsNumber: true })}
                />
                {errors.taxaVendaOnline && (
                  <p className="text-red-500 text-sm">
                    {errors.taxaVendaOnline.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Percentual cobrado pela plataforma de venda online sobre o
                  preço de venda
                </p>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Margem de lucro (%)</Label>
                <Input {...register("margemLucro", { valueAsNumber: true })} />
                {errors.margemLucro && (
                  <p className="text-red-500 text-sm">
                    {errors.margemLucro.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Percentual de lucro desejado sobre o custoImpressão
                </p>
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Custo fixo adicional (R$)</Label>
                <Input
                  {...register("custoFixoAdicional", { valueAsNumber: true })}
                />
                {errors.custoFixoAdicional && (
                  <p className="text-red-500 text-sm">
                    {errors.custoFixoAdicional.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Outros custos fixos envolvidos na impressão
                </p>
              </div>
            </CardContent>
          </Card>
          <div className="flex gap-2">
            <Button type="submit">Calcular custo</Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset();
                setResultado(null);
              }}
            >
              Limpar
            </Button>
          </div>
        </form>
      </div>
      {resultado && (
        <Card className="w-full h-auto overflow-y-auto">
          <CardTitle>Resultados</CardTitle>
          <CardContent className="p-4 font-bold text-green-700 grid grid-cols-2 space-x-4 space-y-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">Impostos</div>
              <div className="text-lg font-semibold">
                R${" "}
                {((resultado.precoFinal * resultado.imposto) / 100).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {resultado.imposto}% do preço
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">
                Taxa de venda online
              </div>
              <div className="text-lg font-semibold">
                R${" "}
                {(
                  (resultado.precoFinal * resultado.taxaVendaOnline) /
                  100
                ).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {resultado.taxaVendaOnline}% do preço
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">
                Custo de produção
              </div>
              <div className="text-lg font-semibold">
                R$ {resultado.custoImpressão.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {(
                  (resultado.custoImpressão / resultado.precoFinal) *
                  100
                ).toFixed(2)}
                % do preço
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">
                Tempo total de impressão
              </div>
              <div className="text-lg font-semibold">
                {`${watch("horas")}`} horas e {`${watch("minutos")}`} minutos
              </div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground">
                Mark Up multiplicador
              </div>
              <div className="text-lg font-semibold">
                {resultado.markup.toFixed(2)}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-muted-foreground">Lucro Líquido</div>
              <div className="text-lg font-semibold text-green-600">
                R${" "}
                {(
                  resultado.precoFinal -
                  resultado.custoImpressão -
                  (resultado.precoFinal * resultado.imposto) / 100 -
                  (resultado.precoFinal * resultado.taxaVendaOnline) / 100
                ).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                {(
                  ((resultado.precoFinal -
                    resultado.custoImpressão -
                    (resultado.precoFinal * resultado.imposto) / 100 -
                    (resultado.precoFinal * resultado.taxaVendaOnline) / 100) /
                    resultado.precoFinal) *
                  100
                ).toFixed(2)}
                % do preço
              </div>
            </div>
            <div className="text-center p-4 bg-green-100 rounded-lg col-span-2">
              <div className="text-sm text-muted-foreground">
                Preço para venda
              </div>
              <div className="text-2xl font-bold text-green-700">
                R$ {resultado.precoFinal.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">
                Valor sugerido para venda considerando custos, taxas e lucro
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
