import { Artist } from './artist'
import { Album } from './album'

export interface Track {
  id: String,
  title: String,
  album: Album,
  artist: Artist,
  duration: Number,
}
