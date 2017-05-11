import { Artist } from './artist'

export interface Album {
  id: string
  title: string
  artist: Artist
  nTracks: number
}
