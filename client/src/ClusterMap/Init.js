
import Generate									from "./Generate"

export const initialize = () => {
	let cluster_z1 = []
	let cluster_z2 = []
	let cluster_z3 = []
	let cluster_z4 = []

	cluster_z1 = Generate.clusterfakfak(1, 
		5, 12, 
		["z1r1p3", "z1r5p3", "z1r9p3"], 
		0)

	cluster_z2 = Generate.clusterfakfak(2, 
		8, 12, 
		["z2r1p4", "z2r5p4", "z2r9p4"], 
		0)

	cluster_z3 = Generate.clusterfakfak(3, 
		6, 13, 
		["z3r1p3", "z3r5p3", "z3r9p3", "z3r13p4", "z3r13p5", "z3r13p6"], 
		0)

	cluster_z4 = Generate.clusterfakfak(4, 
		7, 13, 
		["z4r1p3", "z4r5p3", "z4r9p3", "z4r13p2", "z4r13p1", "z4r13p3", "z4r13p4", , "z4r13p5", , "z4r13p6", "z4r13p7"],
		1)

	return { cluster_z1, cluster_z2, cluster_z3, cluster_z4 }
}

