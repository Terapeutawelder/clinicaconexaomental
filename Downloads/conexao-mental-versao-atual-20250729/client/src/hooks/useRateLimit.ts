import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

/**
 * Simple client-side rate limiting hook
 */
export const useRateLimit = (config: RateLimitConfig) => {
  const { maxAttempts, windowMs, blockDurationMs = 60000 } = config;
  const [attempts, setAttempts] = useState<number[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const { toast } = useToast();

  const checkRateLimit = useCallback(() => {
    const now = Date.now();
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    // Check if user is currently blocked
    if (isBlocked) {
      const lastAttempt = Math.max(...recentAttempts);
      if (now - lastAttempt < blockDurationMs) {
        toast({
          title: "Muitas tentativas",
          description: `Aguarde ${Math.ceil((blockDurationMs - (now - lastAttempt)) / 1000)} segundos antes de tentar novamente.`,
          variant: "destructive",
        });
        return false;
      } else {
        setIsBlocked(false);
      }
    }
    
    // Check if user exceeded rate limit
    if (recentAttempts.length >= maxAttempts) {
      setIsBlocked(true);
      toast({
        title: "Limite excedido",
        description: `Muitas tentativas. Aguarde ${blockDurationMs / 1000} segundos.`,
        variant: "destructive",
      });
      return false;
    }
    
    // Add current attempt
    const newAttempts = [...recentAttempts, now];
    setAttempts(newAttempts);
    
    return true;
  }, [attempts, maxAttempts, windowMs, blockDurationMs, isBlocked, toast]);

  const reset = useCallback(() => {
    setAttempts([]);
    setIsBlocked(false);
  }, []);

  return {
    checkRateLimit,
    isBlocked,
    attemptsRemaining: Math.max(0, maxAttempts - attempts.length),
    reset
  };
};