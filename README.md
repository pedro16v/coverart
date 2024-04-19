A utility that takes a Musicbrainz mbid and fetches album covers from the [CoverArtArchive](https://coverartarchive.org) and returns them as an image.

I run it with `pm2`.

It's designed so that you're app can source images as `http[s]://yourappdomain.com/your-route-to-this-utility/{musicbrainz-release-group-mbid}`