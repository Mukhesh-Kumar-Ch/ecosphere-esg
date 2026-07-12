import { prisma } from "../../../config/prisma.js";

export class SocialReportService {
  static async getSocialReport() {
    // 1. CSR statistics
    const totalActivities = await prisma.csrActivity.count({ where: { deletedAt: null } });
    const activeActivities = await prisma.csrActivity.count({
      where: { deletedAt: null, status: "ONGOING" },
    });
    const totalParticipations = await prisma.employeeParticipation.count();
    const approvedParticipations = await prisma.employeeParticipation.count({
      where: { approvalStatus: "APPROVED" },
    });

    const csrRate = totalParticipations > 0 
      ? (approvedParticipations / totalParticipations) * 100 
      : 100;

    // 2. Training statistics
    const totalTrainings = await prisma.employeeTraining.count();
    const completedTrainings = await prisma.employeeTraining.count({
      where: { status: "COMPLETED" },
    });
    const trainingRate = totalTrainings > 0 
      ? (completedTrainings / totalTrainings) * 100 
      : 100;

    // 3. Challenge statistics
    const totalChallenges = await prisma.challenge.count({ where: { deletedAt: null } });
    const activeChallenges = await prisma.challenge.count({
      where: { deletedAt: null, status: "ACTIVE" },
    });
    const totalChallengeParticipations = await prisma.challengeParticipation.count();
    const completedChallengeParticipations = await prisma.challengeParticipation.count({
      where: { approvalStatus: "APPROVED" },
    });

    const challengeRate = totalChallengeParticipations > 0 
      ? (completedChallengeParticipations / totalChallengeParticipations) * 100 
      : 100;

    // 4. Gamification metrics
    const totalXpAwarded = await prisma.xpTransaction.aggregate({
      where: { points: { gt: 0 } },
      _sum: { points: true },
    });
    const totalRedemptions = await prisma.rewardRedemption.count();

    const rewardsSummary = await prisma.reward.aggregate({
      where: { deletedAt: null },
      _sum: { stock: true },
    });

    // 5. Diversity aggregate breakdown
    const diversityMetrics = await prisma.diversityMetric.findMany();

    // 6. Calculate Composite Social Score
    // CsrRate = 30%, TrainingRate = 40%, ChallengeRate = 30%
    const socialScore = Math.round(csrRate * 0.3 + trainingRate * 0.4 + challengeRate * 0.3);

    return {
      csr: {
        totalActivities,
        activeActivities,
        totalParticipations,
        approvedParticipations,
        csrParticipationRate: Math.round(csrRate),
      },
      participation: {
        totalParticipations,
        approvedParticipations,
      },
      training: {
        totalTrainings,
        completedTrainings,
        trainingCompletionRate: Math.round(trainingRate),
      },
      challenges: {
        totalChallenges,
        activeChallenges,
        totalChallengeParticipations,
        completedChallengeParticipations,
        challengeCompletionRate: Math.round(challengeRate),
      },
      xp: {
        totalXpAwarded: totalXpAwarded._sum.points ?? 0,
      },
      rewards: {
        totalRedemptions,
        availableStock: rewardsSummary._sum.stock ?? 0,
      },
      diversity: diversityMetrics,
      socialScore,
    };
  }
}
export default SocialReportService;
