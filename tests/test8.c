
int f(int x, int y, int z){
  return x * y * z;
}

int Fibo(int n){
  if(n < 2)
    return 1;
  else
    return Fibo(n - 1) + Fibo(n - 2);
}

void FiboSeq(int i, int N){
  int a;
  a = i;
  if (a <= N){
    printf Fibo(i);
    FiboSeq(a + 1, N);
  }
}

int main(){
  int m;
  m = 15;
  FiboSeq(0, m);
}
