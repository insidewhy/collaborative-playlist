import { Artist } from './artist'
import { Album } from './album'

export interface Track {
  id: string
  title: string
  album: Album
  artist: Artist
  duration: number
}
