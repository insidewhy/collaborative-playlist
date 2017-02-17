import { Artist } from './artist'
import { Album } from './album'

export interface Track {
  id: String,
  title: String,
  type: String,
  album: Album,
  artist: Artist,
}
