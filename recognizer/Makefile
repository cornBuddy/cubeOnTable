CC=g++
CFLAGS=-std=c++11 -Wall
SOURCES=main.cpp
OUTPUT=bin/main
APPENDIX=`pkg-config opencv --cflags --libs`

all:
	$(CC) $(CFLAGS) -o $(OUTPUT) $(SOURCES) $(APPENDIX)

clean:
	rm $(OUTPUT)
