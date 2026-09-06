import type { Collection } from '@/types'
import { documents } from './documents'

export const collections: Collection[] = [
  {
    id: 'infra',
    name: 'Infrastructure',
    description: 'Capacity, Kubernetes, reliability, and the living platform.',
    documentIds: documents.filter((d) => d.collectionId === 'infra').map((d) => d.id),
  },
  {
    id: 'security',
    name: 'Security',
    description: 'Policy, identity, and assurance working notes.',
    documentIds: documents.filter((d) => d.collectionId === 'security').map((d) => d.id),
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Cost, FinOps, and spend posture.',
    documentIds: documents.filter((d) => d.collectionId === 'finance').map((d) => d.id),
  },
  {
    id: 'ops',
    name: 'Operations',
    description: 'Incident response and disaster recovery.',
    documentIds: documents.filter((d) => d.collectionId === 'ops').map((d) => d.id),
  },
  {
    id: 'arch',
    name: 'Architecture',
    description: 'Reference designs, zero trust, and migration.',
    documentIds: documents.filter((d) => d.collectionId === 'arch').map((d) => d.id),
  },
]

export const collectionById = Object.fromEntries(
  collections.map((c) => [c.id, c]),
) as Record<string, Collection>
