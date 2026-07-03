"use client";
import { useTranslations } from "next-intl";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AppLayout } from "@/components/layout/AppLayout";
import { useListForestBlocks, useListSpecies } from "@/lib/api";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuthStore, WRITE_ROLES } from "@/stores/auth-store";

function ForestResources() {
  const t = useTranslations("forest");
  const tCommon = useTranslations("common");
  const { data: blocks, isLoading: blocksLoading } = useListForestBlocks();
  const { data: species, isLoading: speciesLoading } = useListSpecies();
  const { can } = useAuthStore();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("blocks.title")}</CardTitle>
            {can(WRITE_ROLES) && <Button size="sm" asChild><Link href="/forest/blocks/new">{t("blocks.addBlock")}</Link></Button>}
          </CardHeader>
          <CardContent>
            {blocksLoading ? <div>{tCommon("loading")}</div> : (
              <Table>
                <TableHeader><TableRow><TableHead>{t("blocks.blockName")}</TableHead><TableHead>{t("blocks.areaHa")}</TableHead><TableHead>{t("blocks.actions")}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {blocks?.results.map(b => (
                    <TableRow key={b.id}>
                      <TableCell>{b.block_name}</TableCell>
                      <TableCell>{b.total_area_ha} hectares</TableCell>
                      <TableCell><Button variant="outline" size="sm" asChild><Link href={`/forest/blocks/${b.id}`}>{t("blocks.view")}</Link></Button></TableCell>
                    </TableRow>
                  ))}
                  {(!blocks?.results || blocks.results.length === 0) && <TableRow><TableCell colSpan={3} className="text-center py-6 text-muted-foreground">{t("blocks.empty")}</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t("species.title")}</CardTitle>
            {can(WRITE_ROLES) && <Button size="sm" asChild><Link href="/forest/species/new">{t("species.addSpecies")}</Link></Button>}
          </CardHeader>
          <CardContent>
            {speciesLoading ? <div>{tCommon("loading")}</div> : (
              <Table>
                <TableHeader><TableRow><TableHead>{t("species.speciesName")}</TableHead><TableHead>{t("species.actions")}</TableHead></TableRow></TableHeader>
                <TableBody>
                  {species?.results.map(s => (
                    <TableRow key={s.id}>
                      <TableCell>{s.species_name}</TableCell>
                      <TableCell><Button variant="outline" size="sm" asChild><Link href={`/forest/species/${s.id}`}>{t("species.view")}</Link></Button></TableCell>
                    </TableRow>
                  ))}
                  {(!species?.results || species.results.length === 0) && <TableRow><TableCell colSpan={2} className="text-center py-6 text-muted-foreground">{t("species.empty")}</TableCell></TableRow>}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("treeCounts.title")}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild><Link href="/forest/tree-counts">{t("treeCounts.viewAll")}</Link></Button>
            {can(WRITE_ROLES) && <Button size="sm" asChild><Link href="/forest/tree-counts/new">{t("treeCounts.addEntry")}</Link></Button>}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t("treeCounts.subtitle")}
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Wildlife Species</CardTitle>
            {can(WRITE_ROLES) && <Button size="sm" asChild><Link href="/forest/wildlife-species/new">Add</Link></Button>}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Manage and track wildlife species found in the forest
            </p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/forest/wildlife-species">View All</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Operational Plans</CardTitle>
            {can(WRITE_ROLES) && <Button size="sm" asChild><Link href="/forest/operational-plans/new">Add</Link></Button>}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create and manage 5-year forest management plans
            </p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/forest/operational-plans">View All</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Timber Collection</CardTitle>
            {can(WRITE_ROLES) && <Button size="sm" asChild><Link href="/forest/timber-collection/new">Add</Link></Button>}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Track timber collection by block and species
            </p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/forest/timber-collection">View All</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Harvest Logs</CardTitle>
            {can(WRITE_ROLES) && <Button size="sm" asChild><Link href="/forest/harvest-logs/new">Add</Link></Button>}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Track all harvested trees and volumes
            </p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/forest/harvest-logs">View All</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Pole Counts</CardTitle>
            {can(WRITE_ROLES) && <Button size="sm" asChild><Link href="/forest/pole-counts/new">Add</Link></Button>}
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Track pole inventory and measurements
            </p>
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/forest/pole-counts">View All</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Page() {
  return <AuthGuard><AppLayout><ForestResources /></AppLayout></AuthGuard>;
}
