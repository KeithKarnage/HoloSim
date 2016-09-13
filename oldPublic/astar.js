// javascript-astar 0.4.0
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a Binary Heap.
// Includes Binary Heap (with modifications) from Marijn Haverbeke.
// http://eloquentjavascript.net/appendix2.html

// (function(definition) {
//     /* global module, define */
//     if(typeof module === 'object' && typeof module.exports === 'object') {
//         module.exports = definition();
//     } else if(typeof define === 'function' && define.amd) {
//         define([], definition);
//     } else {
//         var exports = definition();
//         window.astar = exports.astar;
//         window.Graph = exports.Graph;
//         window.BinaryHeap = exports.BinaryHeap;
//     }
// })(function() {

function pathTo(node){
    var curr = node,
        path = [];
    while(curr.parent) {
        path.push(curr);
        curr = curr.parent;
    }
    return path.reverse();
}

function getHeap() {
    return new BinaryHeap(function(node) {
        return node.f;
    });
}

var astar = {
    /**
    * Perform an A* Search on a graph given a start and end node.
    * @param {Graph} graph
    * @param {GridNode} start
    * @param {GridNode} end
    * @param {Object} [options]
    * @param {bool} [options.closest] Specifies whether to return the
               path to the closest node if the target is unreachable.
    * @param {Function} [options.heuristic] Heuristic function (see
    *          astar.heuristics).
    */
    search: function(graph, start, end, options) {
        graph.cleanDirty();
        options = options || {};
        var heuristic = options.heuristic || astar.heuristics.manhattan,
            closest = options.closest || true;

        var openHeap = getHeap(),
            closestNode = start; // set the start node to be the closest if required

        start.h = heuristic(start, end);

        openHeap.push(start);

        while(openHeap.size() > 0) {


            // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
            var currentNode = openHeap.pop();

            // End case -- result has been found, return the traced path.
            if(currentNode === end) {
                return pathTo(currentNode);
            }

            // Normal case -- move currentNode from open to closed, process each of its neighbours.
            currentNode.closed = true;

            // Find all neighbours for the current node.
            var neighbours = graph.neighbours(currentNode);


            for (var i = 0, il = neighbours.length; i < il; ++i) {

                var neighbour = neighbours[i];
// console.log(neighbour.isWall())
                if (neighbour.closed || neighbour.isWall()) {

                    // Not a valid node to process, skip to next neighbour.
                    continue;
                }


                // The g score is the shortest distance from start to current node.
                // We need to check if the path we have arrived at this neighbour is the shortest one we have seen yet.
                var gScore = currentNode.g + neighbour.getCost(currentNode),
                    beenVisited = neighbour.visited;

                if (!beenVisited || gScore < neighbour.g) {

                    // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
                    neighbour.visited = true;
                    neighbour.parent = currentNode;
                    neighbour.h = neighbour.h || heuristic(neighbour, end, graph.options.portals);
                    // console.log(graph.options.portals)
                    neighbour.g = gScore;
                    neighbour.f = neighbour.g + neighbour.h;
                    graph.markDirty(neighbour);
                    if (closest) {
                        // If the neighbour is closer than the current closestNode or if it's equally close but has
                        // a cheaper path than the current closest node then it becomes the closest node
                        if (neighbour.h < closestNode.h || (neighbour.h === closestNode.h && neighbour.g < closestNode.g)) {
                            closestNode = neighbour;
                        }
                    }

                    if (!beenVisited) {
                        // Pushing to heap will put it in proper place based on the 'f' value.
                        openHeap.push(neighbour);
                    }
                    else {
                        // Already seen the node, but since it has been rescored we need to reorder it in the heap
                        openHeap.rescoreElement(neighbour);
                    }
                }
            }
        }

        if (closest) {
            return pathTo(closestNode);
        }

        // No result was found - empty array signifies failure to find path.
        return [];
    },
    // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
    heuristics: {
        manhattan: function(pos0, pos1, portals) {
            var h = heur(pos0,pos1);
            for(var i in portals) {
                var j = heur(pos0,portals[i]) + heur(portals[i].to,pos1);
                if(j < h) h = j;
            }
            return h;
            
            function heur(pos0,pos1) {
                var d1 = Math.abs(pos1.x - pos0.x);
                var d2 = Math.abs(pos1.y - pos0.y);
                return d1 + d2;
            };
        },
        diagonal: function(pos0, pos1) {
            var D = 1;
            var D2 = Math.sqrt(2);
            var d1 = Math.abs(pos1.x - pos0.x);
            var d2 = Math.abs(pos1.y - pos0.y);
            return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
        }
    },
    cleanNode:function(node){
        node.f = 0;
        node.g = 0;
        node.h = 0;
        node.visited = false;
        node.closed = false;
        node.parent = null;
    }
};

/**
* A graph memory structure
* @param {Array} gridIn 2D array of input weights
* @param {Object} [options]
* @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed
*/
function Graph(gridIn, options) {
    this.options = options || {};
    this.nodes = [];
    this.diagonal = options.diagonal || false;
    this.grid = [];

     for(var y=0, yL=gridIn.length; y<yL; y++) {

        var row = [];
        for(var x=0, xL=gridIn[0].length; x<xL; x++) {
            // if(weights !== undefined)
                // var node = new GridNode(x,y,gridIn[y][x],weights[y][x]);
            // else 
            var node = new GridNode(x,y,gridIn[y][x]);
            row.push(node);
            this.nodes.push(node);
        }
        this.grid.push(row);
    }
    this.init();
}

Graph.prototype.init = function() {
    this.dirtyNodes = [];
    for (var i = 0; i < this.nodes.length; i++) {
        astar.cleanNode(this.nodes[i]);
    }
};

Graph.prototype.cleanDirty = function() {
    for (var i = 0; i < this.dirtyNodes.length; i++) {
        astar.cleanNode(this.dirtyNodes[i]);
    }
    this.dirtyNodes = [];
};

Graph.prototype.markDirty = function(node) {
    this.dirtyNodes.push(node);
};

Graph.prototype.neighbours = function(node) {
    var ret = [],
        x = node.x,
        y = node.y,
        grid = this.grid;

    // West
    if(grid[y] && grid[y][x-1]) {
        ret.push(grid[y][x-1]);
    }

    // East
    if(grid[y] && grid[y][x+1]) {        
        ret.push(grid[y][x+1]);
    }

    // South
    if(grid[y-1] && grid[y-1][x]) {
        ret.push(grid[y-1][x]);
    }

    // North
    if(grid[y+1] && grid[y+1][x]) {
        ret.push(grid[y+1][x]);
    }

    if (this.diagonal) {
        // Southwest
        if(grid[y-1] && grid[y-1][x-1]) {
            ret.push(grid[y-1][x-1]);
        }

        // Southeast
        if(grid[y-1] && grid[y-1][x+1]) {
            ret.push(grid[y-1][x+1]);
        }

        // Northwest
        if(grid[y+1] && grid[y+1][x-1]) {
            ret.push(grid[y+1][x-1]);
        }

        // Northeast
        if(grid[y+1] && grid[y+1][x+1]) {
            ret.push(grid[y+1][x+1]);
        }
    }

    for(var i=0,iL=this.options.portals.length; i<iL; i++) {
        var portal = this.options.portals[i];
        if(x === portal.x
        && y === portal.y) {
            // console.log(grid[])
            ret.push(grid[portal.to.y][portal.to.x]);
            // console.log(x,y,ret)

        }

    }

    return ret;
};

// Graph.prototype.neighbours = function(node) {
//     var ret = [],
//         x = node.x,
//         y = node.y,
//         grid = this.grid;

//     // West
//     if(grid[x-1] && grid[x-1][y]) {
//         ret.push(grid[x-1][y]);
//     }

//     // East
//     if(grid[x+1] && grid[x+1][y]) {
//         ret.push(grid[x+1][y]);
//     }

//     // South
//     if(grid[x] && grid[x][y-1]) {
//         ret.push(grid[x][y-1]);
//     }

//     // North
//     if(grid[x] && grid[x][y+1]) {
//         ret.push(grid[x][y+1]);
//     }

//     if (this.diagonal) {
//         // Southwest
//         if(grid[x-1] && grid[x-1][y-1]) {
//             ret.push(grid[x-1][y-1]);
//         }

//         // Southeast
//         if(grid[x+1] && grid[x+1][y-1]) {
//             ret.push(grid[x+1][y-1]);
//         }

//         // Northwest
//         if(grid[x-1] && grid[x-1][y+1]) {
//             ret.push(grid[x-1][y+1]);
//         }

//         // Northeast
//         if(grid[x+1] && grid[x+1][y+1]) {
//             ret.push(grid[x+1][y+1]);
//         }
//     }

//     return ret;
// };

Graph.prototype.toString = function() {
    var graphString = [],
        nodes = this.grid, // when using grid
        rowDebug, row, y, l;
    for (var x = 0, len = nodes.length; x < len; x++) {
        rowDebug = [];
        row = nodes[x];
        for (y = 0, l = row.length; y < l; y++) {
            rowDebug.push(row[y].weight);
        }
        graphString.push(rowDebug.join(" "));
    }
    return graphString.join("\n");
};

function GridNode(x, y, weight) {
    this.x = x;
    this.y = y;
    this.weight = weight;
}

GridNode.prototype.toString = function() {
    return "[" + this.x + " " + this.y + "]";
};

GridNode.prototype.getCost = function(fromNeighbor) {
    // Take diagonal weight into consideration.
    if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
        return this.weight * 1.41421;
    }
    return this.weight;
};

GridNode.prototype.isWall = function() {
    return this.weight === 0;
};

function BinaryHeap(scoreFunction){
    this.content = [];
    this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
    push: function(element) {
        // Add the new element to the end of the array.
        this.content.push(element);

        // Allow it to sink down.
        this.sinkDown(this.content.length - 1);
    },
    pop: function() {
        // Store the first element so we can return it later.
        var result = this.content[0];
        // Get the element at the end of the array.
        var end = this.content.pop();
        // If there are any elements left, put the end element at the
        // start, and let it bubble up.
        if (this.content.length > 0) {
            this.content[0] = end;
            this.bubbleUp(0);
        }
        return result;
    },
    remove: function(node) {
        var i = this.content.indexOf(node);

        // When it is found, the process seen in 'pop' is repeated
        // to fill up the hole.
        var end = this.content.pop();

        if (i !== this.content.length - 1) {
            this.content[i] = end;

            if (this.scoreFunction(end) < this.scoreFunction(node)) {
                this.sinkDown(i);
            }
            else {
                this.bubbleUp(i);
            }
        }
    },
    size: function() {
        return this.content.length;
    },
    rescoreElement: function(node) {
        this.sinkDown(this.content.indexOf(node));
    },
    sinkDown: function(n) {
        // Fetch the element that has to be sunk.
        var element = this.content[n];

        // When at 0, an element can not sink any further.
        while (n > 0) {

            // Compute the parent element's index, and fetch it.
            var parentN = ((n + 1) >> 1) - 1,
                parent = this.content[parentN];
            // Swap the elements if the parent is greater.
            if (this.scoreFunction(element) < this.scoreFunction(parent)) {
                this.content[parentN] = element;
                this.content[n] = parent;
                // Update 'n' to continue at the new position.
                n = parentN;
            }
            // Found a parent that is less, no need to sink any further.
            else {
                break;
            }
        }
    },
    bubbleUp: function(n) {
        // Look up the target element and its score.
        var length = this.content.length,
            element = this.content[n],
            elemScore = this.scoreFunction(element);

        while(true) {
            // Compute the indices of the child elements.
            var child2N = (n + 1) << 1,
                child1N = child2N - 1;
            // This is used to store the new position of the element, if any.
            var swap = null,
                child1Score;
            // If the first child exists (is inside the array)...
            if (child1N < length) {
                // Look it up and compute its score.
                var child1 = this.content[child1N];
                child1Score = this.scoreFunction(child1);

                // If the score is less than our element's, we need to swap.
                if (child1Score < elemScore){
                    swap = child1N;
                }
            }

            // Do the same checks for the other child.
            if (child2N < length) {
                var child2 = this.content[child2N],
                    child2Score = this.scoreFunction(child2);
                if (child2Score < (swap === null ? elemScore : child1Score)) {
                    swap = child2N;
                }
            }

            // If the element needs to be moved, swap it, and continue.
            if (swap !== null) {
                this.content[n] = this.content[swap];
                this.content[swap] = element;
                n = swap;
            }
            // Otherwise, we are done.
            else {
                break;
            }
        }
    }
};

// return {
//     astar: astar,
//     Graph: Graph,
//     BinaryHeap: BinaryHeap
// };

// });
