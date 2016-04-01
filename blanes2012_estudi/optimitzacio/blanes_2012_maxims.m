clear,clc,close all

P1=[ 236 204 208 264 280 284 368 308 220 228 180 196 ];
P2=[ 268 272 256 248 264 308 368 352 224 244 220 236 ];
P3=[ 224 216 216 224 268 284 368 316 212 248 228 224 ];

minim=Inf;

for p1=200:400
for p2=200:400
for p3=200:400

if (p1 <= p2 & p2 <= p3)
	costAny=0;
	[p1 p2 p3]
	for m=1:12
		costMes = costPotenciaMes([P1(m) P2(m) P3(m)],[p1 p2 p3]);
		costAny = costAny + costMes;
	end
	if costAny < minim
		minim = costAny;
		optimP1=p1; optimP2=p2; optimP3=p3;
	end
end

end
end
end

[optimP1 optimP2 optimP3]
