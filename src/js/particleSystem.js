var data = [];
// var c =[]

var ZPlaneValue = document.getElementById("plane-z-value")
var ZSlider = document.getElementById("z-slidebar")

//projection
var projection = d3.select('#cross-section')


// bounds of the data
const bounds = {};

// create the containment box.
// This cylinder is only to guide development.
// TODO: Remove after the data has been rendered
const createCylinder = () => {
    // get the radius and height based on the data bounds
    const radius = (bounds.maxX - bounds.minX) / 2.0 + 1;
    const height = (bounds.maxY - bounds.minY) + 1;

    // create a cylinder to contain the particle system
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00, wireframe: true });
    const cylinder = new THREE.Mesh(geometry, material);

    // add the containment to the scene
    scene.add(cylinder);
};

var colorScale = d3.scaleSequential( d3.interpolateOranges ).domain([0, 50]);
var greyScale = d3.scaleSequential( d3.interpolateGreys ).domain([0, 50]);

var PlaneGeometry = new THREE.PlaneGeometry( 11,11 );
var PlaneMaterial = new THREE.MeshBasicMaterial( {color: 'cyan', side: THREE.DoubleSide, transparent:true, opacity:0.5 } );
var plane = new THREE.Mesh( PlaneGeometry, PlaneMaterial );
// plane.rotateX(-Math.PI / 2);
plane.position.set(0,0,0);
scene.add(plane)

var particles = new THREE.BufferGeometry();
var particlematerial = new THREE.PointsMaterial( {sizeAttenuation: true, vertexColors: true ,opacity:0.6, transparent:true, size: 0.05 } );

// creates the particle system
const createParticleSystem = (data) => {
    // draw your particle system here!
    // Create arrays to store the particle postions and their respective colors
    var colorArray = [];
    var particlePositions = [];

    // for each particle generate color using colorScale and push it in the color array
    data.forEach((item)=> {
        var particlecolor = new THREE.Color();
        particlecolor.set( colorScale( item.concentration ));
        colorArray.push( particlecolor.r, particlecolor.g, particlecolor.b );
        particlePositions.push( item.X , item.Y , item.Z );
    })

    // set the color and position for each particle as their respective arrays
    particles.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array(particlePositions), 3 ) );
    particles.setAttribute( 'color', new THREE.BufferAttribute( new Float32Array(colorArray), 3 ) );

    
    var particlePoints = new THREE.Points( particles, particlematerial );

    scene.add( particlePoints );
};

const loadData = (file) => {

    // read the csv file
    d3.csv(file).then(function (fileData)
    // iterate over the rows of the csv file
    {
        fileData.forEach(d => {
            // get the min bounds
            bounds.minX = Math.min(bounds.minX || Infinity, d.Points0);
            bounds.minY = Math.min(bounds.minY || Infinity, d.Points1);
            bounds.minZ = Math.min(bounds.minZ || Infinity, d.Points2);

            // get the max bounds
            bounds.maxX = Math.max(bounds.maxX || -Infinity, d.Points0);
            bounds.maxY = Math.max(bounds.maxY || -Infinity, d.Points1);
            bounds.maxZ = Math.max(bounds.maxY || -Infinity, d.Points2);


            // add the element to the data collection
            data.push({
                // concentration density
                concentration: Number(d.concentration),
                // Position
                X: Number(d.Points0),
                Y: Number(d.Points1),
                Z: Number(d.Points2),
                // Velocity
                U: Number(d.velocity0),
                V: Number(d.velocity1),
                W: Number(d.velocity2)
            })
            // c.push(Number(d.concentration))
        });
        // const arrayMinMax = (arr) =>
        // arr.reduce(([min, max], val) => [Math.min(min, val), Math.max(max, val)], [
        //     Number.POSITIVE_INFINITY,
        //     Number.NEGATIVE_INFINITY,
        // ]);
        // // console.log(arrayMinMax(c)) 0, 357.19
        // console.log(colorScale(357.19))

        // draw the containment cylinder
        // TODO: Remove after the data has been rendered
        // createCylinder()
        // create the particle system
        createParticleSystem(data);
        createInitialSlice(data);
        Legend()
    })
};

var createInitialSlice = (data) => {
    projection.selectAll('circle').remove();
    // projection.selectAll('circles').remove();
    var projection2D = [];

    // Generate color for each value in default z
    data.forEach((item) => {
        var color = new THREE.Color();
        if((item.Z >= 0) && (item.Z < 1)) {
            var subset = {"X": item.X , "Y": item.Y , "concentration": item.concentration};
            projection2D.push(subset);
        }
    })

    //Create scales for circle center
    var XCenterScale = d3.scaleLinear().domain([bounds.minX, bounds.maxX])
                                    .range([0, 400 ]);
    var YCenterScale = d3.scaleLinear().domain([bounds.minY, bounds.maxY])
                                    .range([400, 0]);
                    
    // Create circle for each particle on the projection plane
    projection.selectAll("circles")
    .data(projection2D)
    .join("circle")
    .attr("r", 3)
    .attr("cx", row => {return XCenterScale(row.X)})
    .attr("cy", row => {return YCenterScale(row.Y)})
    .style("fill", row => {return colorScale(row.concentration)})
    .attr('transform', 'translate(100,10)');
       
}

function ZPlaneSlide() {
    ZSliderValue = parseFloat(ZSlider.value);
    ZPlaneValue.innerHTML = ZSliderValue;
    plane.position.z = ZSliderValue;
    planeSlice(ZSliderValue, data)

}

function planeSlice(z, data) {
    // clear previous projection
    projection.selectAll('circle').remove();
    // projection.selectAll('circles').remove();

    var planeColors = [];
    var planePoints = [];

    // Generate color for each value in z
    data.forEach((item) => {
        var planeColor = new THREE.Color();
        if((item.Z >= (z - 0.03)) && (item.Z < (z + 0.03))){
            var subset = {"X": item.X , "Y": item.Y , "concentration": item.concentration};
            planePoints.push(subset);
            planeColor.set(colorScale(item.concentration));
            planeColors.push(planeColor.r, planeColor.g, planeColor.b);
        }
        else {
            planeColor.set(greyScale(item.concentration));
            planeColors.push(planeColor.r, planeColor.g, planeColor.b);
        }
    })

    particles.setAttribute('color', new THREE.Float32BufferAttribute(planeColors, 3));

    //Create scales for circle center
    var XCenterScale = d3.scaleLinear().domain([bounds.minX, bounds.maxX])
                                    .range([0, 400 ]);
    var YCenterScale = d3.scaleLinear().domain([bounds.minY, bounds.maxY])
                                    .range([400, 0]);
    
// Create circles for each point of the 2d plane
    projection.selectAll("circles")
    .data(planePoints)
    .join("circle")
    .attr("r", 3)
    .attr("cx", row => {return XCenterScale(row.X);})
    .attr("cy", row => {return YCenterScale(row.Y);})
    .style("fill", row => {return colorScale(row.concentration)})
    .attr('transform', 'translate(100,10)');
    
};


function reset() {
    plane.position.set(0, 0, 0)
    ZPlaneValue.innerHTML = 0;
    ZSlider.value = 0;
    createParticleSystem(data);
    createInitialSlice(data);
    
}

function Legend() {
    //add a legend for Chloropeth map
    // add a legend
    const wMap = 140,
        hMap = 400

    const keyMap = d3
        .select('svg')
        .append('svg')
        .attr('id', 'Legend')
        .attr('width', wMap)
        .attr('height', hMap)
        .attr('class', 'legend')

    const legend = keyMap
        .append('defs')
        .append('svg:linearGradient')
        .attr('id', 'gradient1')
        .attr('x1', '100%')
        .attr('y1', '0%')
        .attr('x2', '100%')
        .attr('y2', '100%')
        .attr('spreadMethod', 'pad')

    legend
        .append('stop')
        .attr('offset', '0%')
        .attr('stop-color', "#7f2704")
        .attr('stop-opacity', 1)

    legend
        .append('stop')
        .attr('offset', '100%')
        .attr('stop-color', "#fff5eb")
        .attr('stop-opacity', 1)

    keyMap
        .append('rect')
        .attr('width', wMap - 100)
        .attr('height', hMap)
        .style('fill', 'url(#gradient1)')
        .attr('transform', 'translate(0,10)')

    const y = d3.scaleLinear().range([hMap, 0]).domain([0, 360])

    const yAxis = d3.axisRight(y)

    keyMap
        .append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(41,10)')
        .call(yAxis)
}


loadData('data/100.csv');