# asafertrip
GovHack repository for safertrip


# Team Name: 
Intrepid Audio Geographers
 
"You don't look back along time, but down through it, like water. Sometimes this comes to the surface, sometimes that, sometimes nothing. Nothing goes away."   Margaret Atwood


# Melbourne.

From the fashions on Chapel street to the restaurants in Carlton. The small bars in Fitzroy, to worshipping cricket at the MCG, or joining the latte-sipping hipsters of Brunswick.

Maybe you’re into the glitz and glamour of Crown on Southbank, or the beach in St Kilda. A fan of the trams that criss-cross the city, or the quiet of the Melbourne Botanic Gardens.

Do you know what Melbourne CBD to Carlton sounds like? Or Brunswick to St Kilda?

‘A Safer Trip’ is a sonic road safety experience. It is a sensory depiction of millions of data points. It renders into sound traffic statistics, crash data and social demographics.

There are many ways to share road safety information. The idea behind ‘A Safer Trip’ was to layer information that shows the fabric of a journey around Melbourne with more depth than traditional real-time GPS warnings, which might just tell you about roadblocks or speed cameras.

We want to show people the trip they’re about to take in a deep way, through sound and statistics.

Music Driving the User Experience

The music tracks were composed by our team to represent the different types of data in an upbeat way.

As the data creates the music based on each unique route, it is likely that no two users will experience the same music.


# The Data and App

The data was taken from home base (CSV and Shapefiles), shipped out to Postgres for some hard labour and reduced to a grid of several million unique data points so it could be used by the Python-driven backend.

The frontend is HTML5 and uses the AngularJS framework and Twitter Bootstrap, along with the Web Audio and Google Maps APIs. The music tracks are played based on stats returned by a custom API delivered by our Python backend.


Demo/Homepage URL:
http://asafertrip.info/
Video URL: 
http://youtu.be/Q8tt5oiBmMc
Datasets Used: 
Australian Bureau of Statistics 2011 Census Data: http://www.abs.gov.au/websitedbs/censushome.nsf/home/datapacks; VicRoads: https://www.data.vic.gov.au/data/dataset/crash-stats-data-extract
Local Event Location:
NSW/Sydney