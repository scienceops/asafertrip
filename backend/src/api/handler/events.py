# coding=utf-8
from numpy.random import randint

SOUNDSCAPE_LENGTH = 30000

weather_msg = {'str_template': 'It’s {} today',
               'rainy_sample': '/resources/0_weather/rainy.mp3',
               'windy_sample': '/resources/0_weather/windy.mp3',
               'sunny_sample': '/resources/0_weather/sunny.mp3',
               'sequence_num': 0}

stat_msgs = {'death': {'str_template': 'Sadly {} people lost their lives',
                        'high_sample': '/resources/7_fatality/fatality_hi.mp3',
                        'low_sample': '/resources/7_fatality/fatality_lo.mp3',
                        'threshold': 0.5,
                        'sequence_num': 7},

             'major': {'str_template': 'And {} serious injuries',
                        'high_sample': '/resources/3_serious/serious_hi.mp3',
                        'low_sample': '/resources/3_serious/serious_lo.mp3',
                        'threshold': 0.5,
                        'sequence_num': 3},

             'injury': {'str_template': 'Also {} injuries',
                         'high_sample': '/resources/1_injuries/injuries_hi.mp3',
                         'low_sample': '/resources/1_injuries/injuries_lo.mp3',
                         'threshold': 0.5,
                         'sequence_num': 1},

             'crashes': {'str_template': 'There were {} crashes',
                          'high_sample': '/resources/2_crash/crash_hi.mp3',
                          'low_sample': '/resources/2_crash/crash_lo.mp3',
                          'threshold': 0.5,
                          'sequence_num': 2},


             'babies': {'str_template': '{} kids under five grace this path',
                          'high_sample': '/resources/5_toddlers/toddlers_hi.mp3',
                          'low_sample': '/resources/5_toddlers/toddlers_lo.mp3',
              'threshold': 0.5,
              'sequence_num': 5},

             'kids': {'str_template': '{} kids aged 5-14 live around here',
                          'high_sample': '/resources/6_kids/kids_hi.mp3',
                          'low_sample': '/resources/6_kids/kids_lo.mp3',
              'threshold': 0.5,
              'sequence_num': 6},

             'senior': {'str_template': '{} people over 75 live this way',
                          'high_sample': '/resources/4_elderly/elderly_hi.mp3',
                          'low_sample': '/resources/4_elderly/elderly_lo.mp3',
              'threshold': 0.5,
              'sequence_num': 4}
             }

#             'TODO': { 'str_template': '{} of collisions with trams',
#              'high_sample': '',
#              'low_sample': '',
#              'threshold': 0.5,
#              'sequence_num': 8}}

def handle_weather(period):
    rand_int = randint(0, high=3)

    if rand_int is 0:
        sample = weather_msg['rainy_sample']
        weather_str = "rainy"
    elif rand_int is 1:
        sample = weather_msg['windy_sample']
        weather_str = "windy"
    else:
        sample = weather_msg['sunny_sample']
        weather_str = "sunny"

    sentence = weather_msg['str_template'].format(weather_str)
    time = period * weather_msg['sequence_num']

    return {'sentence': sentence, 'startTime': time, 'sampleUrl': sample}

def generate_resp(tables, path, integrator):
    names = stat_msgs.keys()
    sequence_nos = [stat_msgs[name]['sequence_num'] for name in names]

    intervals = max(sequence_nos) + 1
    period = SOUNDSCAPE_LENGTH / intervals
    
    aggregates = {}
    for name in names:
        print "getting path integral for "+name
        for (lat, lon) in path:
            print "Performing aggregates at this point.."
        aggregates[name] = integrator(path, tables[name])
        #aggregates = {name: integrator(path, tables[name]) for name in names}

    print "Done integrating..."
    resp = [handle_weather(period)]

    for name, aggregate in aggregates.iteritems():
        msg = stat_msgs[name]
        sentence_plural = msg['str_template'].format(int(aggregate))

        # this is nasty, the inflect package can pluralise nouns
        if int(aggregate) is 1:
            sentence = sentence_plural[:-1]
        else:
            sentence = sentence_plural

        # check if we're above or below the threshold
        if aggregate <= msg["threshold"]:
            sample = msg['low_sample']
        else:
            sample = msg['high_sample']

        # calculate the time ticks
        time = period * msg['sequence_num']

        # create the response dictionary
        resp.append({'sentence': sentence, 'sampleUrl': sample,
                     'startTime': time})

    return resp
