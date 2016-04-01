function cost=costPotenciaMes(maxim,pot)

	cost=0;
	preuP(1) = 25.588674;
	preuP(2) = 15.779848;
	preuP(3) = 3.618499;

	for i=1:3
		% si la potencia demandada es mes petita al 85% de la contractada...
		if maxim(i)<=0.85*pot(i)
			cost = cost + 0.85*pot(i)*preuP(i); %cobra el 85% de la contractada 
		else 
			%si la potencia demandada es mes petita al 105% de la contractada...
			if maxim(i)<=1.05*pot(i)
				cost = cost + maxim(i)*preuP(i); %cobra la potència màxima demandada 
			else 
				%si la potencia demandada es mes gran al 105% de la potència contractada,
				%cobra la maxima registrada + dues vegades la diferència amb el 105% de la contractada
				dif = maxim(i)-1.05*pot(i);							%diferència
				pr = maxim(i)+2*dif; 									%potència registrada
				cost = cost + preuP(i)*pr;
			end
		end
	end
	cost = cost/12;
end
