# coding=utf-8

SOUNDSCAPE_LENGTH = 30000

# coding=utf-8
weather_msg = {'str_template': 'It’s {} today',
               'rainy_sample': '',
               'windy_sample': '',
               'sunny_sample': '',
               'sequence_num': 0}

stat_msgs = {'death': {'str_template': '{} road fatalities',
                        'high_sample': '',
                        'low_sample': '',
                        'threshold': 0.5,
                        'sequence_num': 4},

             'major': {'str_template': '{} serious injuries',
                        'high_sample': '',
                        'low_sample': '',
                        'threshold': 0.5,
                        'sequence_num': 5},

             'injury': {'str_template': '{} injuries',
                         'high_sample': '',
                         'low_sample': '',
                         'threshold': 0.5,
                         'sequence_num': 6},

             'crashes': {'str_template': '{} crashes',
                          'high_sample': '',
                          'low_sample': '',
                          'threshold': 0.5,
                          'sequence_num': 7}
             }


#             'TODO': {'str_template': '{} kids under five live along the way',
#              'high_sample': '',
#              'low_sample': '',
#              'threshold': 0.5,
#              'sequence_num': 1},

#             'TODO': {'str_template': '{} children aged 5-10 live around here',
#              'high_sample': '',
#              'low_sample': '',
#              'threshold': 0.5,
#              'sequence_num': 2},

#             'TODO': {'str_template': '{} people over 75 live this way',
#              'high_sample': '',
#              'low_sample': '',
#              'threshold': 0.5,
#              'sequence_num': 3},

#             'TODO': { 'str_template': '{} of collisions with trams',
#              'high_sample': '',
#              'low_sample': '',
#              'threshold': 0.5,
#              'sequence_num': 8}}

def generate_resp(tables, path, integrator):
    names = stat_msgs.keys()
    sequence_nos = [stat_msgs[name]['sequence_num'] for name in names]

    intervals = max(sequence_nos) + 1
    period = SOUNDSCAPE_LENGTH / intervals

    aggregates = {name: integrator(path, tables[name]) for name in names}

    resp = []
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
