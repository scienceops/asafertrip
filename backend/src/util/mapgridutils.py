# -*- coding: utf-8 -*-
"""
Created on Fri Jul 3rd 11:00:05 2015

@author: 85047
"""



import networkx
import numpy
import json
import math
import string
import datetime
import random
import os

#The bounding box for the analysis
#b1 = (-38.9,144.5)
#b2 = (-37.35,145.5)
b1 = (-38.3,144.2)
b2 = (-37.4,145.7)
GRIDSIZE = 50.0
STEPSIZE = GRIDSIZE/2.0



#haversine formulas. better than others for shortish distances, apparently
def greatCircDistRadians((lat1, lon1), (lat2, lon2)):
    longdiff = lon2-lon1
    latdiff = lat2-lat1
        
    term1 = math.sin(latdiff/2)**2
    term2 = math.cos(lat1)*math.cos(lat2)*math.sin(longdiff/2)**2
    
    return 2*6371.0*math.asin(math.sqrt(term1+term2))*1000.0  #in metres


def greatCircDistDegrees((lat1, lon1), (lat2, lon2)):
    return greatCircDistRadians((lat1*math.pi/180.0, lon1*math.pi/180.0), (lat2*math.pi/180.0, lon2*math.pi/180.0))


def bearingRadians((lat1, lon1), (lat2, lon2)):
    y = math.sin(lon2-lon1) *  math.cos(lat2)
    x = math.cos(lat1)*math.sin(lat2) - math.sin(lat1)*math.cos(lat2)*math.cos(lon2-lon1)
    return math.atan2(y, x)


#Bear in mind that this 'bearing' is a bearing away from true north, so
#unlike the usual maths setup, east is not 0 degrees, but instead north is
def bearingDegrees((lat1, lon1), (lat2, lon2)):
    return (180.0/math.pi)*bearingRadians((lat1*math.pi/180.0, lon1*math.pi/180.0), (lat2*math.pi/180.0, lon2*math.pi/180.0))




#get the (lat,lon) steps such that we dont exceed maxdist_m as
#we step between the two points. (b1, b2) MUST be in the list of
#steps. start point is excluded
def getSteps((a1,a2), (b1,b2), maxdist_m):
    #print "STEPS"
    #print (a1,a2)
    #print (b1,b2)
    totaldist_m = greatCircDistDegrees((a1,a2),(b1,b2))
    if totaldist_m < maxdist_m: # we can safely do it in 1 step
        return [(b1, b2, totaldist_m)]
    
    #otherwise we need to break it up into more than 1 step
    nsteps = int(math.ceil(totaldist_m/maxdist_m))
    if nsteps < 2:
        raise Exception("Internal impossible")
    stepdelta = ((b1-a1)/nsteps, (b2-a2)/nsteps)
    last = (a1, a2)
    cur = (a1+stepdelta[0],a2+stepdelta[1])
    dist = greatCircDistDegrees(last, cur)
    steps = [(cur[0], cur[1], dist)]
    for step in range(1, nsteps-1):
        last = cur
        cur = (last[0]+stepdelta[0],last[1]+stepdelta[1])
        dist = greatCircDistDegrees(last, cur)
        steps.append((cur[0], cur[1], dist))
    last = cur
    cur = (b1, b2)
    dist = greatCircDistDegrees(last, cur)
    steps.append((b1,b2,dist))
    if len(steps) != nsteps:
        raise Exception("nsteps error")
    
    #print steps
    #print "DONE STEPS"
    return steps


class mapGrid:
    
    
    def __init__(self, (minlat, minlon), (maxlat, maxlon), lonsteps):
        #get the bounding box
        self.minlat = min(minlat, maxlat)
        self.minlon = min(minlon, maxlon)
        self.maxlat = max(maxlat, minlat)
        self.maxlon = max(maxlon, minlon)
        
        #work out the step size in lon degrees
        self.lonstepsize = abs(maxlon-minlon)/lonsteps
        self.lonsteps = lonsteps
        
        #work out step size in lat degrees.
        #we do this so that we get approximate squares
        centre = (minlat*0.5+maxlat*0.5, minlon*0.5+maxlon*0.5)
        lonstepsize_m = greatCircDistDegrees(centre, (centre[0], centre[1]+self.lonstepsize))
        latsizetotal =  greatCircDistDegrees((minlat, centre[1]), (maxlat, centre[1]))
        self.latsteps = int(round(latsizetotal/lonstepsize_m))
        self.latstepsize = abs(maxlat-minlat)/self.latsteps
        
        #ok, now we create a matrix
        self.grid = numpy.empty((self.latsteps, self.lonsteps), dtype=float)
    
    
    def __getitem__(self, (lati,loni)):
        return self.grid[lati, loni]
    
    def __setitem__(self, (lati,loni), val):
        self.grid[lati, loni] = val
    
    def getByLatLon(self, lat, lon):
        return self.grid[self.getIndices(lat, lon)]
    
    
    def inBounds(self, lat, lon):
        return not (lat >= self.maxlat or lon >= self.maxlon or lat < self.minlat or lon < self.minlon)
    
    def getIndices(self, lat, lon):
        if not self.inBounds(lat, lon):
            raise Exception("requested indices for lat,lon outside bounding box: "+str(lat)+","+str(lon))
            
        lati = int((lat-self.minlat)/self.latstepsize)
        loni = int((lon-self.minlon)/self.lonstepsize)
        return (lati, loni)
    

    @staticmethod
    def getSuggestedLonStepsForGivenLonstepSize(lonstepsize_mtrs, (minlat, minlon), (maxlat, maxlon)):
        londist_m = greatCircDistDegrees((minlat*0.5+maxlat*0.5, minlon), (minlat*0.5+maxlat*0.5, maxlon))
        return int(londist_m/lonstepsize_mtrs)





#load all the csv's that are in the layers directory
#and whack them into a mapgrid
def loadMapGrids(bb1, bb2, lonsteps):
    res = {}
    for f in [item for item in os.listdir("data") if item.lower().endswith(".csv")]:
        print "Loading "+str(f)
        layername = f.split(".")[0]
        mgrid = mapGrid(bb1, bb2, lonsteps)
        loadField(mgrid, "data/"+f)
        res[layername] = mgrid

    return res
        
        
    





def getPerpendicularDistance((linestart, lineend), point):
    B = greatCircDistDegrees(linestart, point)
    linebearing = bearingDegrees(linestart, lineend)
    pointbearing = bearingDegrees(linestart, point)
    alpha = linebearing-pointbearing
    return abs(B*math.sin((math.pi*alpha)/180.0))
    

    
def minimum_distance((v, w), p):
    
    #special case for very small line segment
    if greatCircDistDegrees(v, w) < 0.01:
        #print "WARNING: minimum distance called for very short line segment... dont you just want to use distance between two points?"
        return greatCircDistDegrees(v, p)        
        
    #This is our line vector
    s = numpy.subtract(w,v)
    
    #This is our scalar multiplier in the projection of p onto s
    t = numpy.dot(numpy.subtract(p, v), s) / numpy.dot(s, s)
    if t < 0:
        return greatCircDistDegrees(p, v)
    elif t > 1:
        return greatCircDistDegrees(p, w)
    proj = numpy.add(v, numpy.multiply(t, s))
    return greatCircDistDegrees(p, proj)
    


#load a field from a csv, into the specified map grid
#
#The csv is assumed to be laid out in 'natural' format, so if
#you laid it over a map the vaues would be in the right positon
#csv should have no header
def loadField(mg, csvfile):
    lines = open(csvfile).readlines()
    if len(lines) != mg.latsteps:
        raise Exception("CSV file has wrong shape. Got "+str(len(lines))+" lines but expected "+str(mg.latsteps))
    lati = mg.latsteps-1
    for line in lines:
        if lati < 0:
            raise Exception("Internal error")
        vals = map(float, line.split(","))
        if len(vals) != mg.lonsteps:
            raise Exception("CSV file has wrong shape. Got "+str(len(vals))+" columns but expected "+str(mg.lonsteps))

        #otherwise we put the values in the mapgrid
        for loni in range(0, mg.lonsteps):
            mg[(lati, loni)] = vals[loni]


        lati -= 1 

        
 

#load an accident field from Hugh's data
#
#accfile: the accident file that high has created
#mgrid: the mgrid object we will need to load it into
#atype: either "death" or "injured" or "accident"
#
#
def createAccidentCSV(accfile, mgrid, atype, csvfiletocreate, expsquares=0):
    
    #accident_no,accident_date,accident_time,accident_type,day_of_week,dca_code,light_condition,no_persons,no_persons_killed,no_persons_injured_2,no_persons_injured_3,no_persons_not_injured,no_vehicles,police_attended,road_geometry,severity,speed_zone,node_id,node_type,lga_name,latitude,longitude
    #T20130005807,2013-02-14,09:30:00,1,5,111,1,2,0,0,1,1,2,1,2,3,60,259215,I,MORELAND,-37.7051948885405,144.911505808892
    if not atype in ["death", "major", "injury", "crashes", "tram"]:
        raise Exception("Dont know what to do with accident type "+str(atype))

    datalines = open(accfile).readlines()[1:]
    res = numpy.zeros((mgrid.latsteps, mgrid.lonsteps),float)
    for line in datalines:
        bits = line.strip().split(",")
        lat, lon = map(float, bits[-2:])
        if not mgrid.inBounds(lat, lon):
            continue
        lati, loni = mgrid.getIndices(lat, lon)

        val = 0.0
        if atype == "death":
            val = int(bits[8])
        elif atype == "major":
            val = int(bits[10])
        elif atype == "injury":
            val = int(bits[9]) + int(bits[10])
        elif atype == "crashes":
            val = 1
        elif atype == "tram":
            val = 1 if bits[5] == "192" else 0
        else:
            raise Exception("Internal Error! "+atype)

        res[lati][loni] += val

    #now expand the result by expsquares squares
    if expsquares > 0:
        resold = res
        res = numpy.zeros((mgrid.latsteps, mgrid.lonsteps),float)
        for lati in range(0, mgrid.latsteps):
            for loni in range(0, mgrid.lonsteps):
                for latd in range(-expsquares, expsquares+1):
                    lati2 = lati+latd
                    for lond in range(-expsquares, expsquares+1):
                        loni2 = loni+lond
                        if lati2 < 0 or loni2 < 0 or lati2 >= mgrid.latsteps or loni2 >= mgrid.lonsteps:
                            continue
                        res[lati][loni] += resold[lati2][loni2]
         

    #ok, now dump out the csv in 'natural' format
    outf = open(csvfiletocreate, "w")
    for lati in range(0, mgrid.latsteps):
        line = ",".join(map(str, res[lati]))
        outf.write(line+"\n")
    outf.close()


def getStepsFromWayPoints(waypoints, stepsize):
    steps = [(waypoints[0][0], waypoints[0][1], 0.0)] #start with our start point at distance 0
    for i in range(0, len(waypoints)-1):
        a = waypoints[i]
        b = waypoints[i+1]
        st = getSteps(a, b, stepsize)
        steps = steps + st
    return steps




def calcPathIntegral(path, mgrid):
    steps = getStepsFromWayPoints(path, STEPSIZE)
    
    #now step along the path
    oldlati, oldloni = -1, -1
    tot = 0.0
    for (lat, lon) in path:
        lati, loni = mgrid.getIndices(lat, lon)
        if lati == oldlati and loni == oldloni:
            continue
        else:
            oldlati = lati
            oldloni = loni
            tot += mgrid[(lati, loni)]

    return tot
        



#start up, read in any available data, and then calculate the the integrals along the given 
#paths and return the result
def testServer(path):
    print "Testing.... "
    lonsteps = mapGrid.getSuggestedLonStepsForGivenLonstepSize(GRIDSIZE, b1, b2)
    #read in  all the data that we have data for
    print "Loading map grids"
    mgrids = loadMapGrids(b1, b2, lonsteps)
    
    #now do the path integral for each map grid
    for mgridname in mgrids:
        print "Calculating path integral for map grid "+str(mgridname)
        tot = calcPathIntegral(path, mgrids[mgridname])
        print "Total is "+str(tot)



#This one writes out accident data by 
def oldTest():

    lonsteps = mapGrid.getSuggestedLonStepsForGivenLonstepSize(GRIDSIZE, b1, b2)
    print "  Suggested number of lon steps for grid size of "+str(GRIDSIZE)+"m is "+str(lonsteps) 
    mgrid = mapGrid(b1, b2, lonsteps)
    mgrid2 = mapGrid(b1, b2, lonsteps)
    mgriddeaths = mapGrid(b1, b2, lonsteps)
    mgridinjury = mapGrid(b1, b2, lonsteps)
    mgridcrash = mapGrid(b1, b2, lonsteps)
    mgridmajor = mapGrid(b1, b2, lonsteps)
    mgridtram = mapGrid(b1, b2, lonsteps)

    #get the accident csvs
    for atype in ["death", "major", "injury", "crashes", "tram"]:
        createAccidentCSV("dataraw/vic_accident_working.csv", mgrid, atype, "data/"+atype+".csv", expsquares=0)

    loadField(mgriddeaths, "data/death.csv")
    loadField(mgridmajor, "data/major.csv")
    loadField(mgridinjury, "data/injury.csv")
    loadField(mgridcrash, "data/crashes.csv")
    loadField(mgridtram, "data/tram.csv")


    




#oldTest()



pathstr = open("path2.txt").readlines()
path = [map(float, line.split()) for line in pathstr]
testServer(path)


