CXX ?= clang++
CXXFLAGS = -std=c++17 -O2 -Wall -Wextra -Iinclude -Isrc

SRC = src/graph.cpp src/algorithms.cpp src/rules.cpp
MAIN_SRC = src/main.cpp $(SRC)
TEST_SRC = tests/test_engine.cpp $(SRC)

TARGET = bin/fraudgraph_engine
TEST_TARGET = bin/test_engine

all: $(TARGET) $(TEST_TARGET)

$(TARGET): $(MAIN_SRC)
	@mkdir -p bin
	$(CXX) $(CXXFLAGS) $(MAIN_SRC) -o $(TARGET)
	@echo "Build successful: $(TARGET)"

$(TEST_TARGET): $(TEST_SRC)
	@mkdir -p bin
	$(CXX) $(CXXFLAGS) $(TEST_SRC) -o $(TEST_TARGET)
	@echo "Build successful: $(TEST_TARGET)"

test: $(TEST_TARGET)
	./$(TEST_TARGET)

clean:
	rm -rf bin

.PHONY: all test clean
